import type {CheerioAPI} from 'cheerio';

export function abs_url(context: CheerioAPI, value: string, base_uri?: string): string {
    if (value.includes('://')) {
        return value;
    }

    base_uri ??= context._options.baseURI?.toString();

    return new URL(value, base_uri).href;
}
