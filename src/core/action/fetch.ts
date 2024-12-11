import {isValidUrl} from '../../util';
import {ActionError} from '../../error/action_error';
import {html_axios} from '../chainy_axios';
import type {CacheRequestConfig} from 'axios-cache-interceptor';
import type {CheerioAPI} from 'cheerio';

export async function fetch(context: any, value: string, request?: CacheRequestConfig): Promise<CheerioAPI> {
    if (!isValidUrl(value)) {
        throw new ActionError('Not a valid url');
    }

    const {data} = await html_axios.get<CheerioAPI>(value, request);
    return data;
}

