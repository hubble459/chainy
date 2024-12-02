export function regex(context: any, value: string, regex: RegExp, replace = '') {
    return value.replace(regex, replace);
}
