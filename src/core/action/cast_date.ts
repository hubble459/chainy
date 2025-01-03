import {parse, type Locale} from 'date-fns';
import {ActionError} from '../../error/action_error';

/**
 * https://date-fns.org/v4.1.0/docs/parse
 */
export function cast_date(_context: any, value: string, format = 'MM/dd/yyyy', reference_date: Date = new Date(), locale?: Locale): Date {
    const date = parse(value, format, reference_date, {locale});

    if (isNaN(date.valueOf())) {
        throw new ActionError('Not a valid date');
    }

    return date;
}
