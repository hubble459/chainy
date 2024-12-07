import {ActionError} from '../../error/action_error';
import {allText, isJQuery, ownText} from '../../util';

export function text(context: any, value: JQuery | string | number | boolean | bigint | symbol | Date, text_type?: 'own' | 'all'): string {
    switch (typeof value) {
        case 'string':
            return value;

        case 'bigint':
        case 'symbol':
        case 'number':
            return value.toString();

        case 'boolean':
            return (value ? 'true' : 'false');

        case 'object':
        case 'function':
            if (isJQuery(value)) {
                return (text_type === 'own' ? ownText(value) : allText(value)) as string;
            }
            break;

        default:
            break;
    }

    throw new ActionError();
}
