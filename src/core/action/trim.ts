import { action } from './action';
import { regex } from './regex';

type Return<Value> = Value extends string
    ? string
    : never;

export const trim = action('trim', ($, value): Return<typeof value> => {
    return regex.run($, value, { regex: /^\s+|\s+$/g }) as Return<typeof value>;
});
