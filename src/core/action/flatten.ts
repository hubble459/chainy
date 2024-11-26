import { UnprocessableError } from '../../error/unprocessable_error';
import { action } from './action';

export const flatten = action('flatten', ($, value) => {
    if (!Array.isArray(value)) {
        throw new UnprocessableError();
    }

    return value.flat();
}, true);
