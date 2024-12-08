import {parse, type Locale} from 'date-fns';

/**
 * https://date-fns.org/v4.1.0/docs/parse
 */
export function cast_date(_context: any, value: string, format = 'MM/dd/yyyy', reference_date: Date = new Date(), locale?: Locale): Date {
    return parse(value, format, reference_date, {locale});
}
