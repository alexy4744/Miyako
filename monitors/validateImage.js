/* eslint no-use-before-define: 0 */

const ImageValidator = require("../modules/ImageValidator");
const getURL = require("get-urls");
const regex = /\.(jpe?g|png|gif|bmp|tiff)$/gi;

module.exports = async (client, msg) => {
  if (!msg.guild) return 1;
  if (!msg.guild.cache || !msg.guild.cache.imageHashes || msg.guild.cache.imageHashes.length < 1) return 1;

  if (msg.attachments.size > 0) {
    for (const attachment of msg.attachments) {
      if (attachment[1].file.attachment.match(regex)) return validate(attachment[1].file.attachment);
    }
  } else {
    const urls = getURL(msg.content);
    if (urls.size > 0) {
      for (const url of urls) {
        if (await validate(url) === 0) return 0;
      }
    }
    return 1;
  }

  async function validate(src) {
    const validator = new ImageValidator(src);
    const image = await validator.init().catch(e => ({ "error": e }));

    if (image.error) return 1;

    const match = await validator.matchArray(msg.guild.cache.imageHashes, msg.guild.cache.imageBuffers).catch(err => ({ "error": err }));

    if (match.error) return 1;

    if (match) {
      try {
        await msg.author.send({
          embed: {
            title: `${msg.emojis.fail}Your message has been deleted in ${msg.guild.name}!`,
            description: `[**This image**](${src}) has been banned by the admins of this guild, therefore, your message has been deleted.`,
            image: { "url": src },
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