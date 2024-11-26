import { UnprocessableError } from '../../error/unprocessable_error';
import { action } from './action';

export const split = action('split', ($, value, options: { separator: string | RegExp, limit?: number }) => {
    if (typeof value !== 'string') {
        throw new UnprocessableError();
    }

    return value.split(options.separator, options.limit);
});
