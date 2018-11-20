const Monitor = require("../modules/Base/Monitor");
const ImageFilter = require("../modules/ImageFilter");
const getURL = require("get-urls");
const regex = /\.(jpe?g|png|gif|bmp|tiff)$/gi;

module.exports = class FilterImage extends Monitor {
  constructor(...args) {
    super(...args, {
      ignoreBots: false
    });
  }

  async run(msg) {
    if (!msg.guild.cache.filterImage.images || msg.guild.cache.filterImage.images.length < 1) return 1;

    if (msg.attachments.size > 0) {
      for (const attachment of msg.attachments) {
        if (attachment[1].url.match(regex)) {
          this.test(msg, attachment[1].url);
        }
      }
    } else {
      const urls = getURL(msg.content);
      if (urls.size < 1) return 1;

      for (const url of urls) {
        if (!await this.test(msg, url)) return 0;
      }
    }
  }

  async test(msg, url) {
    const Filter = new ImageFilter();
    const image = await Filter.loadImage(url).catch(error => ({ error }));
    if (image.error) return 1;

    const match = await Filter.match(msg.guild.cache.filterImage.images).catch(error => ({ error }));
    if (!match || match.error) return 1;

    this.takeAction(msg, url);

    return 0;
  }

  takeAction(msg, url) {
    const action = msg.guild.cache.filterImage.action;

    if (action === "mute") this.client.commands.mute.mute(msg.member, this.client.utils.stringToMillis.convert("5m").ms);
    else if (action === "ban") this.client.commands.ban.ban(msg.member, null);

    msg.delete().catch(() => { });

    msg.author.send({
      embed: {
        title: `${msg.emojis.fail}Your message has been deleted in ${msg.guild.name}!`,
        description: `[**This image**](${url}) has been banned by the admins of this guild; therefore, your message has been **deleted**. ${action === "mute" ? "You have also been **muted**" : ""}`,
        image: { url },
        color: msg.colors.fail
      }
    }).catch(() => { });
  }
};