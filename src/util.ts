import type {Action} from './core';

export function expect_array(action: Action<any, any[], any>) {
    // @ts-expect-error expect_array field doesn't exist
    action.expect_array = true;
}

export function isJQuery(object: unknown): object is JQuery {
    return (typeof object === 'object' && !!object && 'jquery' in object);
}

export function isJQueryStatic(object: unknown): object is JQueryStatic {
    return (typeof object === 'function' && object.name === 'jQuery');
}

export function allText($: JQuery): string | string[] {
    const texts = [];
    for (let i = 0; i < $.length; i++) {
        texts.push($.eq(i).text());
    }
    return texts.length < 2
        ? texts[0] ?? ''
        : texts;
}

export function ownText($: JQuery, glue = ''): string | string[] {
    const texts = [];
    for (let i = 0; i < $.length; i++) {
        const text = $.eq(i)
            .contents()
            .filter((i, el) => typeof el !== 'number' && el.nodeType === 3)
            .map((i, el) => el.nodeValue)
            .get()
            .join(glue);
        texts.push(text);
    }
    return texts.length < 2
        ? texts[0] ?? ''
        : texts;
}

export function isValidUrl(url: string): boolean {
    const pattern = new RegExp('^(https?:\\/\\/)?' // validate protocol
      + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // validate domain name
      + '((\\d{1,3}\\.){3}\\d{1,3}))' // validate OR ip (v4) address
      + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // validate port and path
      + '(\\?[;&a-z\\d%_.~+=-]*)?' // validate query string
      + '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return pattern.test(url);
}
