import {isJQuery} from '../../util';
import {action} from './action';

type Return<Value> = Value extends unknown
    ? Value[]
    : never;

export const list = action('list', ($, value): Return<typeof value> => {
    let array: typeof value[];

    if (isJQuery(value)) {
        array = value.toArray().map(element => $(element)) as any;
    } else if (Array.isArray(value)) {
        array = value;
    } else {
        array = [value];
    }

    return array as Return<typeof value>;
});
