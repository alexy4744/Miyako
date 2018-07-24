// Originally from https://stdlib.com/@nemo/src/web-scraper/
const request = require("request-promise-native");
const cheerio = require("cheerio");
const parseAll = require("html-metadata").parseAll;

/**
* A simple and powerful scraper
* @param {String} url Url to fetch
* @param {String} selector The HTML element to find
* @param {String} fn The jQuery action/function to execute on the selector
* @param {Array} args The arguments to pass into fn, the jQuery action/function.
* @returns {Object} Resolves only the metadata if no selector and fn is provided, otherwise, resolves scraped data and metadata.
**/

module.exports = (url, selector, fn, args = []) => new Promise(async (resolve, reject) => {
  const $ = await request({
    url: url,
    headers: {
      // Fake user-agent lol so that the "browser" is supported on some sites.
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3489.0 Safari/537.36"
    },
    transform: body => cheerio.load(body)
  }).catch(e => ({
    "error": e
  }));

  if ($.error) return reject($.error);

  const metadata = await parseAll($).catch(e => ({
    "error": e
  }));

  if (metadata.error) return reject(metadata.error);

  if (!selector && !fn) resolve(metadata); // eslint-disable-line
  else resolve({ // eslint-disable-line
    url: url,
    meta: metadata,
    scraped: ($(selector).length ? $(selector).toArray() : [$(selector)]).map(el => $(el)[fn](...args)) // Spread operator to use the args array as the function parameters
  });
});