/**
 * https://date-fns.org/v4.1.0/docs/parse
 */
export function abs_url(context: JQueryStatic, value: string, base_uri?: string): string {
    if (value.includes('://')) {
        return value;
    }

    base_uri ??= context('html')[0]!.baseURI;

    return new URL(value, base_uri).href;
}
