/* eslint-disable prefer-const */
import axios, {type InternalAxiosRequestConfig} from 'axios';
import {setupCache} from 'axios-cache-interceptor';
import {load} from 'cheerio';

export let json_axios = setupCache(axios.create());
export let html_axios = setupCache(axios.create());
html_axios.defaults.transformResponse = function (this: InternalAxiosRequestConfig, data: any) {
    if (typeof data === 'string') {
        return load(data, {baseURI: this.url});
    }

    throw new Error('Page did not reply with HTML content');
};
