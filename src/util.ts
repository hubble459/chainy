export function isJQuery(object: unknown): object is JQuery {
    return (typeof object === 'function' && object.name === 'jQuery')
      || (typeof object === 'object' && !!object && 'jquery' in object);
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
