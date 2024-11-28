import {UnprocessableError} from '../../error/unprocessable_error';
import {isJQuery} from '../../util';
import {action} from './action';

type Return<Value> = Value extends JQuery
    ? string
    : never;

export const attribute = action('attribute', ($, value, attributes: string | string[]): Return<typeof value> => {
    if (isJQuery(value)) {
        if (typeof attributes === 'string') {
            attributes = [attributes];
        }

        for (const attr of attributes) {
            const val = value.attr(attr);
            if (val) {
                return val as Return<typeof value>;
            }
        }

        throw new Error('Could not find attribute');
    }

    throw new UnprocessableError();
});
