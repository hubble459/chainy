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
        const chain = new Chain();

        const first_text_trim = (chain: Chain<JQuery[]>) => chain.do('first').do('text').do('trim');

        const manga = {
            title: chain
                .do('select', 'h1:first')
                .do(first_text_trim)
                .run($),
            description: chain
                .do('select', 'meta[name="description"]')
                .do('first')
                .do('attribute', 'content')
                .do('trim')
                .run($)
        };

        expect(manga).toEqual({
            title: 'Lord of Destiny Wheel',
            description: 'A planet called Ghost Star suddenly appeared, causing the earth\'s animals and plants to evolve into monsters that can destroy humans. At the time of human extinction, people accidentally discovered a way to log into the ghost star, and found that they could gain power against mon',
        });
    });
});
