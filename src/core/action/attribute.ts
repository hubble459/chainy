export function attribute(context: any, value: JQuery, attributes: string | string[]) {
    if (typeof attributes === 'string') {
        attributes = [attributes];
    }

    for (const attr of attributes) {
        const val = value.attr(attr);
        if (val) {
            return val;
        }
    }

    throw new Error('Could not find attribute');
}
