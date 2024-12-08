import {expect_array} from '../../../util';

export function divide(_context: any, value: number[]): number {
    const first = value.shift() ?? 0;
    return value.reduce((a, v) => a / v, first);
}

expect_array(divide);
