import { UnprocessableError } from '../../error/unprocessable_error';
import { action } from './action';

type Return<Value> = Value extends string
    ? string
    : never;

export const regex = action('regex', ($, value, options: { regex: RegExp, replace?: string }): Return<typeof value> => {
    if (typeof value !== 'string') {
        throw new UnprocessableError();
    }

    return value.replace(options.regex, options.replace ?? '') as Return<typeof value>;
});
