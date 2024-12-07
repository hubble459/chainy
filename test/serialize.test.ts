import {describe, expect, test} from 'bun:test';
import {Chainy} from '../src/core/chainy';

describe('serialize', () => {
    test('json', () => {
        const chain = new Chainy()
            .add('select', 'h1')
            .add('first')
            .add('text');

        expect(JSON.parse(JSON.stringify(chain))).toEqual({
            type: 'and',
            items: [
                {action: 'select', options: ['h1']},
                {action: 'first', options: []},
                {action: 'text', options: []},
            ],
        });
    });

    test('from json', () => {
        const chain = new Chainy()
            .add('select', 'h1')
            .or(chain => chain.add('select', 'h2'))
            .or(chain => chain.add('select', 'h3'))
            .or(chain => chain.add('select', 'h3').add('first'))
            .or(chain => chain
                .add('select', 'h3')
                .or(chain => chain.add('select', 'h4')))
            .add('first')
            .add('text');

        const json = JSON.stringify(chain);

        const parsed = Chainy.fromJSON(json);

        expect(JSON.stringify(parsed)).toEqual(json);
    });

    // test('stringify', () => {
    //     const result = new Chain()
    //         .add('select', 'h1')
    //         .or(chain => chain.add('select', 'h2'))
    //         .or(chain => chain.add('select', 'h3'))
    //         .or(chain => chain.add('select', 'h3').add('first'))
    //         .or(chain => chain
    //             .add('select', 'h3')
    //             .or(chain => chain.add('select', 'h4')))
    //         .add('first')
    //         .add('text');

    //     expect(JSON.parse(JSON.stringify(result))).toEqual({
    //         chain: [{
    //             or: [{
    //                 action: 'select',
    //                 options: 'h1',
    //             },
    //             {action: 'select', options: 'h2'},
    //             {action: 'select', options: 'h3'},
    //             {
    //                 chain: [
    //                     {action: 'select', options: 'h3'},
    //                     {action: 'first'},
    //                 ],
    //             },
    //             {or: [{action: 'select', options: 'h3'}, {action: 'select', options: 'h4'}]}],
    //         },
    //         {action: 'first'},
    //         {action: 'text'}],
    //     });
    // });
});
