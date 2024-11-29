import {describe, expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import jQueryFactory from 'jquery';
import {Chain} from '../src/core/chain';

describe('chain', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const {window} = new JSDOM(html) as unknown as Window;
    const $ = jQueryFactory(window, true);

    test('select > text', () => {
        const chain = new Chain();

        const result = chain
            .add('select', 'h1')
            .add('first')
            .add('text')
            .execute($);

        expect(result).toBe('Lord of Destiny Wheel');
    });

    test('select > text', () => {
        const chain = new Chain();

        const result = chain
            .add('select', 'ul.manga-info-text li:nth-child(7) a')
            .add('text')
            .execute($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('select > text > join', () => {
        const chain = new Chain();

        const result = chain
            .add('select', 'ul.manga-info-text li:nth-child(7) a')
            .add('text')
            .add('join', '-')
            .execute($);

        expect(result).toEqual('Action-Adventure-Drama-Fantasy-Shounen');
    });

    test('or', () => {
        const chain = new Chain();

        const result = chain
            .add('select', '#does-not-exist')
            .or('select', 'ul.manga-info-text li:nth-child(7) a')
            .add('text')
            .execute($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('double or', () => {
        const chain = new Chain();

        const result = chain
            .add('select', '#does-not-exist')
            .or('select', '#does-not-exist-2')
            .or('select', 'ul.manga-info-text li:nth-child(7) a')
            .add('text')
            .execute($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('or chain', () => {
        const chain = new Chain();

        const result = chain
            .add('select', '#does-not-exist')
            .or(chain => chain
                .add('select', 'ul.manga-info-text li:nth-child(7) a')
                .add('text'))
            .add('text')
            .execute($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('fail', () => {
        const chain = new Chain();

        expect(chain
            .add('select', '#does-not-exist')
            .add('text')
            .execute.bind(chain, $)).toThrow('No elements found');
    });
});
