import { isJQuery } from '../../util';
import { action } from './action';

export const list = action('list', ($, value) => {
    let array: typeof value[];

    if (isJQuery(value)) {
        array = value.toArray().map(element => $(element)) as any;
    } else if (Array.isArray(value)) {
        array = value;
    } else {
        array = [value];
    }

    return array;
});
