export class BadRequestError extends Error {
    statusCode = 400;
    constructor() {
        super(`Bad request`);
    }
}
