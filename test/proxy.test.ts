import {describe, expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {chainy} from '../src/core/chainy_proxy';
import {load} from 'cheerio';

describe('chain proxy', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const $ = load(html, {baseURI: 'https://mangakakalot.com/manga/fm939336'});

    test('select > text', () => {
        const result = chainy()
            .select('h1')
            .first()
            .text()
            .run($);

        expect(result).toBe('Lord of Destiny Wheel');
    });

    test('select > text', () => {
        const result = chainy()
            .select('ul.manga-info-text li:nth-child(7) a')
            .text()
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('select > text > join', () => {
        const result = chainy()
            .select('ul.manga-info-text li:nth-child(7) a')
            .text()
            .join('-')
            .run($);

        expect(result).toEqual('Action-Adventure-Drama-Fantasy-Shounen');
    });

    test('or', () => {
        const result = chainy()
            .select('#does-not-exist')
            .or_select('ul.manga-info-text li:nth-child(7) a')
            .text()
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('double or', () => {
        const result = chainy()
            .select('#does-not-exist')
            .or_select('#does-not-exist-2')
            .or_select('ul.manga-info-text li:nth-child(7) a')
            .text()
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('or chain', () => {
        const result = chainy()
            .select('#does-not-exist')
            .or(chain => chain
                .select('ul.manga-info-text li:nth-child(7) a')
                .text())
            .text()
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('and or chain', () => {
        const result = chainy()
            .add(chain => chain
                .select('#does-not-exist')
                .text())
            .or(chain => chain
                .select('ul.manga-info-text li:nth-child(7) a')
                .text())
            .run($);

        expect(result).toEqual(['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen']);
    });

    test('fail', () => {
        const chain = chainy();
        expect(chain
            .select('#does-not-exist')
            .text()
            .run.bind(chain, $)).toThrow('No elements found');
    });

    test('use first and', () => {
        const result = chainy()
            .select('div.story-info-right h1')
            .or_select('ul.manga-info-text h1')
            .or_select('h1')
            .or_select('h2')
            .first()
            .text()
            .trim()
            .run($);

        expect(result).toEqual('Lord of Destiny Wheel');
    });


    test('async chain', async () => {
        const result = chainy()
            .select_first('h1')
            .text()
            .value_string('https://example.com')
            .fetch()
            .select('h1')
            .first()
            .text()
            .run($);

        expect(result).toBeInstanceOf(Promise);
        expect(await result).toEqual('Example Domain');
    });


    test('async chain with error', () => {
        const result = chainy()
            .select_first('h1')
            .text()
            .value_string('https://example.com')
            .fetch()
            .select('h2')
            .first()
            .text()
            .run($);

        expect(result).toBeInstanceOf(Promise);
        expect(result).rejects.toThrow('No elements found');
    });

    test('async chain with error before async', () => {
        const result = chainy()
            .select_first('#hamburger')
            .text()
            .fetch()
            .select('h2')
            .first()
            .text();

        // Does not throw inside a Promise, but if used inside a promise function
        // the result is the same
        expect((async () => await result.run($))()).rejects.toThrow('No elements found');
    });
});
