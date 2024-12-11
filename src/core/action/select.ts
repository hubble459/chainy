import type {CheerioAPI, Cheerio} from 'cheerio';
import type {Element} from 'domhandler';
import {isCheerio, isCheerioAPI} from '../../util';

export function select(context: CheerioAPI, value: CheerioAPI | Cheerio<Element>, selector: string) {
    if (!(isCheerio(value) || isCheerioAPI(value))) {
        value = context;
    }

    const elements = typeof value === 'function' ? value(selector) : value.find(selector);

    if (elements.length === 0) {
        throw new Error('No elements found');
    }

    return elements.toArray().map(el => context(el) as Cheerio<Element>);
}
