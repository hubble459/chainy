import { UnprocessableError } from '../../error/unprocessable_error';
import { allText, isJQuery, ownText } from '../../util';
import { action } from './action';

type Return<Value> = Value extends JQuery | string | number | boolean | bigint | symbol | Date
    ? string
    : never;

export const text = action('text', ($, value, text_type?: 'own' | 'all'): Return<typeof value> => {
    switch (typeof value) {
        case 'string':
            return value as Return<typeof value>;

        case 'bigint':
        case 'symbol':
        case 'number':
            return value.toString() as Return<typeof value>;

        case 'boolean':
            return (value ? 'true' : 'false') as Return<typeof value>;

        case 'object':
        case 'function':
            if (isJQuery(value)) {
                return (text_type === 'own' ? ownText(value) : allText(value)) as Return<typeof value>;
            }
            break;

        default:
            break;
    }

    throw new UnprocessableError();
});
