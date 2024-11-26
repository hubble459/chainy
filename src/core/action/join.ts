import { UnprocessableError } from '../../error/unprocessable_error';
import { action } from './action';

export const join = action('join', ($, value, separator?: string) => {
    if (!Array.isArray(value)) {
        throw new UnprocessableError();
    }

    return value.join(separator);
}, true);
