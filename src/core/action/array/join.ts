import {expect_array} from '../../../util';

export function join(context: any, value: string[], separator?: string): string {
    return value.join(separator);
}

expect_array(join);
