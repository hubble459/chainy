import {isJQuery} from '../../util';

export function select_first(context: any, value: JQueryStatic | JQuery, selector: string) {
    const elements = isJQuery(value)
        ? value.find(selector)
        : value(selector);

    if (elements.length === 0) {
        throw new Error('No elements found');
    }

    return elements.eq(0);
}
