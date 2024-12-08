import {actions, type GetOptions, type GetType, type PossibleActions} from './action';
import {Chainy} from './chainy';

type ChainyProxy<Context = JQueryStatic, Value = Context, Previous = unknown> = {
    [K in keyof PossibleActions<Context, Value>]: (...options: GetOptions<K>) => ChainyProxy<Context, GetType<K, Value, Context>, Value>;
} & {
    [K in keyof PossibleActions<Context, Previous> as `or_${K}`]: (...options: GetOptions<K>) => ChainyProxy<Context, Value | GetType<K, Previous, Context>, Previous>;
} & {
    add<V>(closure: (chainy: ChainyProxy<Context, Value, Previous>) => ChainyProxy<unknown, V>): ChainyProxy<Context, V, Value>;
    or<V>(closure: (chainy: ChainyProxy<Context, Previous, Previous>) => ChainyProxy<unknown, V>): ChainyProxy<Context, V | Value, Previous>;
    toChainy(): Chainy<Context, Value, Previous>;
    run(input: Context): Value;
} & Omit<Chainy, 'add' | 'or'>;

export function chainy<Context = JQueryStatic, Value = Context, Previous = unknown>(type: 'and' | 'or' = 'and'): ChainyProxy<Context, Value, Previous> {
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
