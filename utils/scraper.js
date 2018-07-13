const request = require("request-promise-native");
const cheerio = require("cheerio");
const parseAll = require("html-metadata").parseAll;

module.exports = (url, selector, fn, args = []) => new Promise(async (resolve, reject) => {
  const opts = {
    url: url,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    },
    transform: body => cheerio.load(body)
  };

  const $ = await request(opts).catch(e => reject(e));
  const metadata = await parseAll($).then(() => metadata.url = url).catch(e => reject(e));

  if (!selector && !fn && args.length < 1) resolve(metadata); // eslint-disable-line
  else resolve({ // eslint-disable-line
    url: url,
    meta: metadata,
    scraped: ($(selector).length ? $(selector).toArray() : [$(selector)]).map(el => $(el)[fn](...args))
  });
});
