import type {Cheerio, CheerioAPI} from 'cheerio';
import {select} from './select';
import type {Element} from 'domhandler';

export function select_first(context: CheerioAPI, value: CheerioAPI | Cheerio<Element>, selector: string) {
    return select(context, value, selector)[0]!;
}
