import type {Cheerio} from 'cheerio';
import {ActionError} from '../../error/action_error';
import {allText, isCheerio, ownText} from '../../util';
import type {Element} from 'domhandler';

export function text(context: any, value: Cheerio<Element> | string | number | boolean | bigint | symbol | Date, text_type?: 'own' | 'all'): string {
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
            if (isCheerio(value)) {
                return (text_type === 'own' ? ownText(value) : allText(value));
            }

            break;

        default:
            break;
    }

    throw new ActionError();
}
