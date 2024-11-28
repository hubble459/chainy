import {isJQuery} from '../../util';
import {action} from './action';

export const select = action('select', ($, value, selector: string): JQuery[] => {
    const elements = isJQuery(value) ? value.find(selector) : $(selector);

    if (elements.length === 0) {
        throw new Error('No elements found');
    }

    return elements.toArray().map(el => $(el));
});
