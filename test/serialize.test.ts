import {describe, expect, test} from 'bun:test';
import {Chainy} from '../src/core/chainy';

describe('serialize', () => {
    test('json', () => {
        const chain = new Chainy()
            .add('select', 'h1')
            .add('first')
            .add('text');

        expect(chain.toObject()).toEqual({
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

        const json = chain.stringify();

        const parsed = Chainy.fromJSON(json);

        expect(parsed.stringify()).toEqual(json);
    });

    test('to string', () => {
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

        const string = chain.toString();

        expect(string).toEqual('chain:select([[1],"h1"])>>chain:select([[1],"h2"])>>chain:select([[1],"h3"])>>chain:select([[1],"h3"])>>first>>chain:select([[1],"h3"])>>chain:select([[1],"h4"])>>first>>text');
    });
});
