import {UnprocessableError} from '../../error/unprocessable_error';
import {action} from './action';

type Return<Value> = Value extends string
    ? string[]
    : never;

export const split = action('split', ($, value, options: {separator: string | RegExp; limit?: number}): Return<typeof value> => {
    if (typeof value !== 'string') {
        throw new UnprocessableError();
    }

    return value.split(options.separator, options.limit) as Return<typeof value>;
});
