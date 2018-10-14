/* eslint no-use-before-define: 0 */

const ImageFilter = require("../modules/ImageFilter");
const getURL = require("get-urls");
const regex = /\.(jpe?g|png|gif|bmp|tiff)$/gi;

module.exports = (client, msg) => {
  if (!msg.guild ||
    !msg.guild.cache ||
    !msg.guild.cache.imageHashes ||
    !msg.guild.cache.imageBuffers ||
    msg.guild.cache.imageHashes.length < 1 ||
    msg.guild.cache.imageBuffers < 1) return 1;

  if (msg.attachments.size > 0) {
    for (const attachment of msg.attachments) {
      if (attachment[1].file.attachment.match(regex)) validate(attachment[1].file.attachment);
    }
  } else {
    const urls = getURL(msg.content);
    if (urls.size > 0) {
      for (const url of urls) {
        if (validate(url) === 0) return 0;
      }
    }

    return 1;
  }

  async function validate(url) {
    const Filter = new ImageFilter();
    const image = await Filter.loadImage(url).catch(e => ({ "error": e }));

    if (image.error) return 1;

    const match = await Filter.matchArray(msg.guild.cache.imageHashes).catch(e => ({ "error": e }));

    if (match.error) return 1;

    if (match) {
      try {
        await msg.author.send({
          embed: {
            title: `${msg.emojis.fail}Your message has been deleted in ${msg.guild.name}!`,
            description: `[**This image**](${url}) has been banned by the admins of this guild; therefore, your message has been deleted.`,
            image: { url },
            color: msg.colors.fail
          }
        });
        await msg.delete();
      } catch (error) {
        // noop
      } finally {
        return 0; // eslint-disable-line
      }
    } else return 1; //eslint-disable-line
  }
};