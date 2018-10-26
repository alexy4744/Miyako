const Monitor = require("../modules/Base/Monitor");
const ImageFilter = require("../modules/ImageFilter");
const getURL = require("get-urls");
const regex = /\.(jpe?g|png|gif|bmp|tiff)$/gi;

module.exports = class FilterImage extends Monitor {
  constructor(...args) {
    super(...args);
  }

  async run(msg) {
    if (!msg.guild.cache.images || msg.guild.cache.images.length < 1) return 1;

    if (msg.attachments.size > 0) {
      for (const attachment of msg.attachments) {
        if (attachment[1].file.attachment.match(regex)) await this._validate(msg, attachment[1].file.attachment);
      }
    } else {
      const urls = getURL(msg.content);
      if (urls.size > 0) {
        for (const url of urls) {
          if (await this._validate(msg, url) === 0) return 0;
        }
      }

      return 1;
    }
  }

  async _validate(msg, url) {
    const Filter = new ImageFilter();
    const image = await Filter.loadImage(url).catch(e => ({ "error": e }));

    if (image.error) return 1;

    const match = await Filter.matchArray(msg.guild.cache.images).catch(e => ({ "error": e }));

    if (match.error) return 1;

    if (match) {
      msg.delete().catch(() => { });

      msg.author.send({
        embed: {
          title: `${msg.emojis.fail}Your message has been deleted in ${msg.guild.name}!`,
          description: `[**This image**](${url}) has been banned by the admins of this guild; therefore, your message has been deleted.`,
          image: { url },
          color: msg.colors.fail
        }
      }).catch(() => { });

      return 0;
    } else return 1; //eslint-disable-line
  }
};