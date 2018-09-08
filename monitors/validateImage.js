/* eslint no-use-before-define: 0 */

const ImageValidator = require("../modules/ImageValidator");
const regex = /\.(jpe?g|png|gif|bmp|tiff)$/gi;

module.exports = (client, msg) => {
  if (!msg.guild) return 1;
  if (!msg.guild.cache.imageHashes || msg.guild.cache.imageHashes.length < 1) return 1;

  if (msg.attachments.size > 0) {
    for (const attachment of msg.attachments) {
      if (attachment[1].file.attachment.match(regex)) return validate(attachment[1].file.attachment);
    }
  } else if (msg.content.match(regex)) {
    return validate(msg.content);
  } else {
    return 1;
  }

  async function validate(src) {
    const validator = new ImageValidator(src);
    const image = await validator.init().catch(e => ({ "error": e }));

    if (image.error) return 0;

    const match = await validator.matchArray(msg.guild.cache.imageHashes).catch(err => ({ "error": err }));

    if (match.error) return 0;

    if (match) {
      msg.channel.send("XAJAWWHAHE");
      return 0;
    } else return 1; //eslint-disable-line
  }
};