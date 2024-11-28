import {describe, expect, test} from 'bun:test';
import {Chain} from '../src/core/chain';

describe('serialize', () => {
    test('json', () => {
        const chain = new Chain();

        const result = chain
            .do('select', 'h1')
            .do('first')
            .do('text')
            .toJSON();

        expect(result).toEqual({
            chain: [
                {
                    action: 'select',
                    options: 'h1',
                },
                {
                    action: 'first',
                    options: undefined,
                },
                {
                    action: 'text',
                    options: undefined,
                },
            ],
        });
    });

    test('serialize', () => {
        const chain = new Chain();

        const result = chain
            .do('select', 'h1')
            .or('select', 'h2')
            .or(chain => chain.do('select', 'h3'))
            .or(chain => chain.do('select', 'h3').do('first'))
            .or(chain => chain.do('select', 'h3').or('select', 'h4'))
            .do('first')
            .do('text');

        console.log((JSON.stringify(result)));

        expect(JSON.parse(JSON.stringify(result))).toEqual({
            chain: [{
                or: [{
                    action: 'select',
                    options: 'h1',
                },
                {action: 'select', options: 'h2'},
                {action: 'select', options: 'h3'},
                {
                    chain: [
                        {action: 'select', options: 'h3'},
                        {action: 'first'},
                    ],
                },
                {or: [{action: 'select', options: 'h3'}, {action: 'select', options: 'h4'}]}],
            },
            {action: 'first'},
            {action: 'text'}],
        });

        console.log(JSON.stringify(result));
    });
});
