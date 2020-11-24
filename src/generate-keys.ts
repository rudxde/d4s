import * as crypto from 'crypto';

export function generateKeys(): Promise<[publicKey: string, privateKey: string]> {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        }, async (err, publicKey, privateKey) => {
            try {
                if (err) {
                    console.error(err);
                    return;
                }
                resolve([publicKey, privateKey]);
                return;
            } catch (err) {
                reject(err);
            }
        });
    });
}

