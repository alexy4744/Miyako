/* eslint no-use-before-define: 0 */

const Command = require("../../modules/Command");
const ImageValidator = require("../../modules/ImageValidator");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Bans the last message sent that has an image attachment or an image via an URL`,
      usage: () => [`banimg`, `banimg http://example.com/example.png`],
      aliases: ["banimg"],
      userPermissions: ["administrator"],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  async run(msg, args) {
    const messages = Array.from(msg.channel.messages);

    let found = false;

    if (args[0]) return validateImage(args[0]);

    const pendingMessage = await msg.channel.send({
      embed: {
        title: `${msg.emojis.pending}Attempting to find the last message sent with an attachment...`,
        color: msg.colors.pending
      }
    });

    for (let i = messages.length - 1; i > 0; i--) { // Start from the last message sent going backward.
      if (found) break;
      if (messages[i][1].attachments.size > 0) messages[i][1].attachments.forEach(attachment => validateImage(attachment.url, messages[i][1]));
    }

    if (!found) {
      await pendingMessage.delete().catch(() => { });
      return msg.fail(`I could not find any image attachments in the last couple of messages in this channel!`);
    }

    async function validateImage(url, m) {
      found = true;

      const Validator = new ImageValidator(url);
      const image = await Validator.init().catch(e => ({ "error": e }));

      if (image.error) return msg.error(image.error, `ban this image!`);

      await pendingMessage.delete().catch(() => { });

      const message = await msg.channel.send({
        embed: {
          title: `${msg.emojis.pending}Are you sure you want to ban this image?`,
          image: { "url": url },
          footer: { "text": m ? `Sent by ${m.author.tag} on ${m.createdAt.toLocaleString()}` : null },
          color: msg.colors.pending
        }
      });

      const confirmation = await message.prompt(msg.author.id).catch(e => ({
        "error": e
      }));

      if (confirmation.error) return msg.cancelledCommand(`${msg.author.toString()} has failed to provide a response within **15** seconds, therefore I have cancelled the command!`);

      if (confirmation) {
        const messageToDelete = m ? await m.delete().catch(e => ({ "error": e })) : null;

        try {
          await Validator.saveImage(msg.guild);
          message.success(`This image has been successfully banned!`, messageToDelete && messageToDelete.error ? `However this image needs to be deleted manually from the channel, as I have encountered an error while doing so` : null);
        } catch (error) {
          message.error(error, `ban this image!`);
        }

        await message.delete().catch(() => { });
      } else if (!confirmation) {
        return msg.cancelledCommand();
      }
    }
  }
};