// Originally from https://stdlib.com/@nemo/lib/scrape
const request = require("request-promise-native");
const cheerio = require("cheerio");
const parseAll = require("html-metadata").parseAll;

module.exports = async (url, selector, action) => {
  const $ = await request({
    url: "https://soundcloud.com/catvlyst/tell-me",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    },
    transform: body => cheerio.load(body)
  }).catch(e => {
    throw new Error(e);
  });

  const metadata = await parseAll($).catch(e => {
    throw new Error(e);
  });
  console.log(metadata)
  return {
    $: $,
    metadata: metadata
  };
};