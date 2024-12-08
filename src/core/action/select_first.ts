import {select} from './select';

export function select_first(context: JQueryStatic, value: JQueryStatic | JQuery, selector: string) {
    return select(context, value, selector)[0]!;
}
