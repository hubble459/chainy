import {ActionError} from '../../error/action_error';

export function matches(context: any, value: string, regex: RegExp) {
    if (!regex.test(value)) {
        throw new ActionError('Does not match');
    }

    return value;
}
