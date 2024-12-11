import {actions, type GetOptions, type GetType, type PossibleActions} from './action';
import {Chainy} from './chainy';

type IsPromise<Yes, Value> = Yes extends true ? true : Value extends Promise<any> ? true : false;

type ChainyProxy<Context = JQueryStatic, Value = Context, Previous = unknown, Async = false> = {
    [K in keyof PossibleActions<Context, Value>]: (...options: GetOptions<K>) => ChainyProxy<Context, GetType<K, Value, Context>, Value, IsPromise<Async, GetType<K, Value, Context>>>;
} & {
    [K in keyof PossibleActions<Context, Previous> as `or_${K}`]: (...options: GetOptions<K>) => ChainyProxy<Context, Value | GetType<K, Previous, Context>, Previous, IsPromise<Async, GetType<K, Previous, Context>>>;
} & {
    add<V>(closure: (chainy: ChainyProxy<Context, Value, Previous>) => ChainyProxy<unknown, V>): ChainyProxy<Context, V, Value, IsPromise<Async, Value>>;
    or<V>(closure: (chainy: ChainyProxy<Context, Previous, Previous>) => ChainyProxy<unknown, V>): ChainyProxy<Context, V | Value, Previous, IsPromise<Async, V>>;
    toChainy(): Chainy<Context, Value, Previous>;
    run(input: Context): Async extends true ? Promise<Value> : Value;
} & Omit<Chainy, 'add' | 'or'>;

export function chainy<Context = JQueryStatic, Value = Context, Previous = unknown, Async = false>(type: 'and' | 'or' = 'and'): ChainyProxy<Context, Value, Previous, Async> {
    const chain = new Chainy(type);

    const or = chain.or.bind(chain);
    const add = chain.add.bind(chain);

    Object.defineProperties(chain, {
        ...Object.fromEntries(Object.keys(actions).map(action => [action, {get: () => (...options: any[]) => chain.add(action as any, ...options)}])),
        ...Object.fromEntries(Object.keys(actions).map(action => [`or_${action}`, {get: () => (...options: any[]) => chain.or(action as any, ...options)}])),
        toChainy: {
            get: function () {
                return () => this;
            },
        },
        or: {
            get: function () {
                return (callback: any, ...args: any) => {
                    if (typeof callback === 'function') {
                        chain.items.push(callback(chainy('or')));
                    } else {
                        or(callback, ...args);
                    }
                    return this;
                };
            },
        },
        add: {
            get: function () {
                return (callback: any, ...args: any) => {
                    if (typeof callback === 'function') {
                        chain.items.push(callback(chainy('and')));
                    } else {
                        add(callback, ...args);
                    }
                    return this;
                };
            },
        },
    });

    return chain as any;
}
