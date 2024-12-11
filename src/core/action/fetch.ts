import {isValidUrl} from '../../util';
import {ActionError} from '../../error/action_error';
import {html_axios} from '../chainy_axios';
import type {CacheRequestConfig} from 'axios-cache-interceptor';

export async function fetch(_context: JQueryStatic, value: string, request?: CacheRequestConfig): Promise<JQueryStatic> {
    if (!isValidUrl(value)) {
        throw new ActionError('Not a valid url');
    }

    const {data} = await html_axios.get<JQueryStatic>(value, request);
    return data;
}

