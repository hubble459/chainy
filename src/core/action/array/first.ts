import {ActionError} from '../../../error/action_error';
import {expect_array} from '../../../util';

export function first<V extends unknown[]>(context: any, value: V): V[0] {
    if (!Array.isArray(value)) {
        throw new ActionError();
    }

    return value[0];
}

expect_array(first);
