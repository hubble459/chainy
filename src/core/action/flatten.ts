import {UnprocessableError} from '../../error/unprocessable_error';
import {action} from './action';

type Return<Value> = Value extends unknown[]
    ? FlatArray<Value, 1>
    : never;

export const flatten = action('flatten', ($, value): Return<typeof value> => {
    if (!Array.isArray(value)) {
        throw new UnprocessableError();
    }

    return value.flat() as Return<typeof value>;
}, true);
