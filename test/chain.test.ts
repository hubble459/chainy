import {describe, expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {Chainy} from '../src/core/chainy';
import {load} from 'cheerio';

describe('chain', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const $ = load(html, {baseURI: 'https://mangakakalot.com/manga/fm939336'});

    test('select > text', () => {
        const chain = new Chainy();

        const result = chain
            .add('select', 'h1')
            .add('first')
            .add('text')
            .run($);

        expect(result).toBe('Lord of Destiny Wheel');
    });

    test('select > text', () => {
        const chain = new Chainy();

        const result = chain
            .add('select', 'ul.manga-info-text li:nth-child(7) a')
            .add('text')
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('select > text > join', () => {
        const chain = new Chainy();

        const result = chain
            .add('select', 'ul.manga-info-text li:nth-child(7) a')
            .add('text')
            .add('join', '-')
            .run($);

        expect(result).toEqual('Action-Adventure-Drama-Fantasy-Shounen');
    });

    test('or', () => {
        const chain = new Chainy();

        const result = chain
            .add('select', '#does-not-exist')
            .or('select', 'ul.manga-info-text li:nth-child(7) a')
            .add('text')
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('double or', () => {
        const chain = new Chainy();

        const result = chain
            .add('select', '#does-not-exist')
            .or('select', '#does-not-exist-2')
            .or('select', 'ul.manga-info-text li:nth-child(7) a')
            .add('text')
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('or chain', () => {
        const chain = new Chainy();

        const result = chain
            .add('select', '#does-not-exist')
            .or(chain => chain
                .add('select', 'ul.manga-info-text li:nth-child(7) a')
                .add('text'))
            .add('text')
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('and or chain', () => {
        const chain = new Chainy();

        const result = chain
            .add(chain => chain
                .add('select', '#does-not-exist')
                .add('text'))
            .or(chain => chain
                .add('select', 'ul.manga-info-text li:nth-child(7) a')
                .add('text'))
            .add('text')
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('fail', () => {
        const chain = new Chainy();

        expect(chain
            .add('select', '#does-not-exist')
            .add('text')
            .run.bind(chain, $)).toThrow('No elements found');
    });
});
