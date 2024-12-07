export function split(context: any, value: string, separator: string | RegExp, limit?: number) {
    return value.split(separator, limit);
}
