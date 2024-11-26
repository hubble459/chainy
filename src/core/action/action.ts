export type Action<Options = any, Return = any> = <Value>($: JQueryStatic, value: Value, options: Options) => Return;

export function action<Name extends string, Closure extends Action, TakeArray extends boolean = false>(name: Name, run: Closure, take_array?: TakeArray) {
    return {
        name,
        take_array: take_array as any as TakeArray extends true ? true : false,
        run,
    } as const;
}
