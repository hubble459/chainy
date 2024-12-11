import {describe, expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {allText, ownText} from '../src/util';
import {load} from 'cheerio';

describe('texts', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const $ = load(html, {baseURI: 'https://mangakakalot.com/manga/fm939336'});

    test('own text', () => {
        expect(ownText($('ul.manga-info-text li:nth-child(7) a'), ' ')).toEqual('Action Adventure Drama Fantasy Shounen');
    });

    test('all text', () => {
        expect(allText($('ul.manga-info-text li:nth-child(7) a'))).toEqual('ActionAdventureDramaFantasyShounen');
    });
});
