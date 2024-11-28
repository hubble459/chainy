import {UnprocessableError} from '../../error/unprocessable_error';
import {action} from './action';

type Return<Value> = Value extends unknown[]
    ? Value[number]
    : never;

export const first = action('first', ($, value): Return<typeof value> => {
    if (!Array.isArray(value)) {
        throw new UnprocessableError();
    }

    return value[0] as Return<typeof value>;
}, true);
