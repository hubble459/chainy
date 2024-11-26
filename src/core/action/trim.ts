import { action } from './action';
import { regex } from './regex';

export const trim = action('trim', ($, value) => {
    return regex.run($, value, { regex: /^\s+|\s+$/g });
});
