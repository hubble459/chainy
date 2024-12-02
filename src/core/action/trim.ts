import {regex} from './regex';

export function trim(context: any, value: string) {
    return regex(context, value, /^\s+|\s+$/g);
}
