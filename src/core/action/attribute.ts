import type {Cheerio, CheerioAPI} from 'cheerio';
import type {Element} from 'domhandler';

export function attribute(context: CheerioAPI, value: Cheerio<Element>, attributes: string | string[]) {
    if (typeof attributes === 'string') {
        attributes = [attributes];
    }

    for (const attr of attributes) {
        const val = value.attr(attr);
        if (val) {
            return val;
        }
    }

    throw new Error('Could not find attribute');
}
