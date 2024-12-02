export class ActionError extends Error {
    constructor(message = 'Could not process value') {
        super(message);
    }
}
