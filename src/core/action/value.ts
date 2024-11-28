import {action} from './action';

export const value = action('value', ($, value, v) => {
    return v;
});
