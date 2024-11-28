import {UnprocessableError} from '../../error/unprocessable_error';
import {action} from './action';

type Return<Value> = Value extends string
    ? true
    : never;

export const matches = action('matches', ($, value, regex: RegExp): Return<typeof value> => {
    if (typeof value !== 'string') {
        throw new UnprocessableError();
    }

    if (!regex.test(value)) {
        throw new Error('Does not match');
    }

    return true as Return<typeof value>;
});
