import {UnprocessableError} from '../../error/unprocessable_error';
import {action} from './action';

type Return<Value> = Value extends unknown[]
    ? string
    : never;

export const join = action('join', ($, value, separator?: string): Return<typeof value> => {
    if (!Array.isArray(value)) {
        throw new UnprocessableError();
    }

    return value.join(separator) as Return<typeof value>;
}, true);
