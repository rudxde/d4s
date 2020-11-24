import express, { Request, Response, NextFunction } from 'express';
import { BadRequestError } from './bad-request';
import { Docker } from './docker';
import { generateKeys } from './generate-keys';
import { NotFoundError } from './not-found';

async function main(): Promise<void> {
    const app = express();
    app.use(express.json({ limit: "100mb" }));

    app.put('/privatekey', (req: Request, res: Response, next: NextFunction) => {
        const issuer = req.body?.issuer;
        if (!issuer) {
            console.log(req.body);
            throw new BadRequestError();
        }
        getPrivateKey(issuer)
            .then(() => next())
            .catch(err => next(err));
    })

    app.put('/publickey/:service', (req: Request, res: Response, next: NextFunction) => {
        const issuer = req.body?.issuer;
        if (!issuer) {
            throw new BadRequestError();
        }
        const targetService = req.params.service;
        if (!targetService) {
            throw new BadRequestError();
        }
        const mountTarget = req.params.target;
        getPublicKey(issuer, targetService, mountTarget)
            .then(() => next())
            .catch(err => next(err));
    })

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        console.error(err);
        if (err.statusCode) {
            return res.sendStatus(err.statusCode);
        }
        res.sendStatus(500);
        next();
    });

    const host = process.env.host || '0.0.0.0';
    const port = parseInt(process.env.port!) || 80;

    app.listen(port, host, () =>
        console.log(`Server listening on host [${host}] and port ${port}!`),
    );
}

main()
    .catch(err => console.error(err));

async function getPrivateKey(issuer: string): Promise<void> {
    const privateKeyName = `${issuer}_privateKey`;
    const publicKeyName = `${issuer}_publicKey`;

    const allSecretNames = await Docker.Swarm.Secret.listNames();
    if (allSecretNames.includes(privateKeyName)) {
        await Docker.Swarm.Secret.remove(privateKeyName)
    }
    if (allSecretNames.includes(publicKeyName)) {
        await Docker.Swarm.Secret.remove(publicKeyName)
    }
    const [publicKey, privateKey] = await generateKeys();
    await Docker.Swarm.Secret.create(publicKeyName, publicKey);
    await Docker.Swarm.Secret.create(privateKeyName, privateKey);
    await Docker.Swarm.Secret.addToService(privateKeyName, 'privatekey', issuer);
}

async function getPublicKey(issuer: string, forService: string, target?: string): Promise<void> {
    const publicKeyName = `${forService}_publicKey`;
    const allSecretNames = await Docker.Swarm.Secret.listNames();
    if (!allSecretNames.includes(publicKeyName)) {
        throw new NotFoundError();
    }
    await Docker.Swarm.Secret.addToService(publicKeyName, target || `${forService}_publickey`, issuer);
}
