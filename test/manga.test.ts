import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import jQueryFactory from 'jquery';
import { Chain } from '../src/core/chain';

describe('manga', () => {
    const html = readFileSync('./test/fragment/mangakakalot.html', 'utf-8');
    const { window } = new JSDOM(html) as unknown as Window;
    const $ = jQueryFactory(window, true);

    test('select > text', () => {
        const text_trim = (chain: Chain<JQuery | JQuery[]>) => chain.do('text').do('trim');

        const manga_builder = {
            title: new Chain()
                .do('select', 'h1:first')
                .do('first')
                .do(text_trim),
            alternative_titles: new Chain()
                .do('select', 'h2.story-alternative')
                .do('first')
                .do(text_trim)
                .do('regex', { regex: /^Alternative : / })
                .do('split', { separator: /\w*;[\w\n]*/ })
                .do('trim'),
            description: new Chain()
                .do('select', 'meta[name="description"]')
                .do('first')
                .do('attribute', 'content')
                .do('trim'),
            genres: new Chain()
                .do('select', 'ul.manga-info-text li:nth-child(7) a')
                .do(text_trim),
            authors: new Chain()
                .do('select', 'ul.manga-info-text li:nth-child(2) a')
                .do(text_trim),
            status: new Chain()
                .do('select', 'ul.manga-info-text li:nth-child(3)')
                .do('first')
                .do(text_trim)
                .do('regex', { regex: /^Status :\s*/ })
                .do(chain => chain.do('matches', /on-?going/ig).do('value', 'Ongoing'))
                .or(chain => chain.do('matches', /drop|stop|unfinished/ig).do('value', 'Unfinished'))
                .or(chain => chain.do('matches', /finished/ig).do('value', 'Finished'))
                .or(chain => chain.do('value', 'Ongoing')),
            is_ongoing: new Chain()
                .do('select', 'ul.manga-info-text li:nth-child(3)')
                .do('first')
                .do(text_trim)
                .do('regex', { regex: /^Status :\s*/ })
                .do(chain => chain.do('matches', /on-?going/ig).do('value', 'Ongoing'))
                .or(chain => chain.do('matches', /drop|stop|unfinished/ig).do('value', 'Unfinished'))
                .or(chain => chain.do('matches', /finished/ig).do('value', 'Finished'))
                .or(chain => chain.do('value', 'Ongoing'))
                .do('matches', /Ongoing/),
        };

        const manga = Object.fromEntries(Object.entries(manga_builder).map(([key, chain]) => [key, chain.run($)]))

        expect(manga).toEqual({
            title: 'Lord of Destiny Wheel',
            alternative_titles: ['The Lord of the Wheel of', '命轮之主！当异变降临人间', 'Lord of Destiny Wheel', 'Lord of the Wheel of Fortune! When Changes Come to the World', '隠しジョブでレベルアップ'],
            description: 'A planet called Ghost Star suddenly appeared, causing the earth\'s animals and plants to evolve into monsters that can destroy humans. At the time of human extinction, people accidentally discovered a way to log into the ghost star, and found that they could gain power against mon',
            genres: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Shounen'],
            authors: ['iCiyuan', '动漫', 'Armode Culture'],
            status: 'Ongoing',
            is_ongoing: true,
        });
    });

    test('json', () => {
        const text_trim = (chain: Chain<JQuery | JQuery[]>) => chain.do('text').do('trim');

        const manga_builder = {
            title: new Chain()
                .do('select', 'h1:first')
                .do('first')
                .do(text_trim),
            alternative_titles: new Chain()
                .do('select', 'h2.story-alternative')
                .do('first')
                .do(text_trim)
                .do('regex', { regex: /^Alternative : / })
                .do('split', { separator: /\w*;[\w\n]*/ })
                .do('trim'),
            description: new Chain()
                .do('select', 'meta[name="description"]')
                .do('first')
                .do('attribute', 'content')
                .do('trim'),
            genres: new Chain()
                .do('select', 'ul.manga-info-text li:nth-child(7) a')
                .do(text_trim),
            authors: new Chain()
                .do('select', 'ul.manga-info-text li:nth-child(2) a')
                .do(text_trim),
            status: new Chain()
                .do('select', 'ul.manga-info-text li:nth-child(3)')
                .do('first')
                .do(text_trim)
                .do('regex', { regex: /^Status :\s*/ })
                .do(chain => chain.do('matches', /on-?going/ig).do('value', 'Ongoing'))
                .or(chain => chain.do('matches', /drop|stop|unfinished/ig).do('value', 'Unfinished'))
                .or(chain => chain.do('matches', /finished/ig).do('value', 'Finished'))
                .or(chain => chain.do('value', 'Ongoing')),
            is_ongoing: new Chain()
                .do('select', 'ul.manga-info-text li:nth-child(3)')
                .do('first')
                .do(text_trim)
                .do('regex', { regex: /^Status :\s*/ })
                .do(chain => chain.do('matches', /on-?going/ig).do('value', 'Ongoing'))
                .or(chain => chain.do('matches', /drop|stop|unfinished/ig).do('value', 'Unfinished'))
                .or(chain => chain.do('matches', /finished/ig).do('value', 'Finished'))
                .or(chain => chain.do('value', 'Ongoing'))
                .do('matches', /Ongoing/),
        };

        const json = JSON.stringify(manga_builder);

        console.log(json);
    })
});
