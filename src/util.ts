import {type Cheerio, type CheerioAPI} from 'cheerio';
import type {Action} from './core';
import type {Element} from 'domhandler';

export function isCheerioAPI(value: any): value is CheerioAPI {
    return typeof value === 'function' && value.name === 'initialize';
}

export function isCheerio(value: any): value is Cheerio<Element> {
    return typeof value === 'object' && value.constructor.name === 'LoadedCheerio';
}

export function expect_array(action: Action<any, any[], any>) {
    // @ts-expect-error expect_array field doesn't exist
    action.expect_array = true;
}

export function allText($: Cheerio<Element>): string {
    return $.text();
}

export function ownText($: Cheerio<Element>, glue = ''): string {
    return $.contents()
        .filter((i, el) => el.nodeType === 3)
        .map((i, el) => el.nodeValue)
        .get()
        .join(glue);
}

export function isValidUrl(url: string): boolean {
    const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,8}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
    return pattern.test(url);
}
