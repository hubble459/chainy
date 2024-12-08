import * as date_fns from 'date-fns';
// @ts-expect-error bitch-ass package doesn't have types https://www.npmjs.com/package/parse-human-relative-time
import parse_human from 'parse-human-relative-time/date-fns';
const parse = parse_human(date_fns);

export function cast_relative_date(_context: any, value: string): Date {
    const now = new Date();

    if (/now|hot|latest|just|a few/gi.test(value)) {
        return now;
    }

    return parse(value, now);
}
