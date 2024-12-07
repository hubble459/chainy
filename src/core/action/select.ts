import {isJQuery, isJQueryStatic} from '../../util';

export function select(context: JQueryStatic, value: JQueryStatic | JQuery, selector: string) {
    const elements = isJQuery(value) ? value.find(selector) : isJQueryStatic(value) ? value(selector) : context(selector);

    if (elements.length === 0) {
        throw new Error('No elements found');
    }

    return elements.toArray().map(el => context(el));
}
