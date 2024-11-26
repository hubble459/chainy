export class UnprocessableError extends Error {
    constructor() {
        super('Could not process value');
    }
}
