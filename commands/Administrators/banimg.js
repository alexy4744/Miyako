/* eslint no-use-before-define: 0 */

const Command = require("../../modules/Command");
const ImageFilter = require("../../modules/ImageFilter");

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
    if (args[0]) return validateImage(args[0]);

    const pendingMessage = await msg.channel.send({
      embed: {
        title: `${msg.emojis.pending}Attempting to find the last message sent with an attachment...`,
        color: msg.colors.pending
      }
    });

    const attachments = msg.channel.messages.filter(m => m.attachments.size > 0);

    await pendingMessage.delete().catch(() => { });

    if (attachments.size < 1) return msg.fail(`I could not find any image attachments in the last couple of messages in this channel!`);

    return validateImage(attachments.last().attachments.first().url, attachments.last());

    async function validateImage(url, m) {
      const Filter = new ImageFilter();
      const image = await Filter.loadImage(url).catch(e => ({ "error": e }));

      if (image.error) return msg.error(image.error, `ban this image!`);

      await pendingMessage.delete().catch(() => { });

      const message = await msg.channel.send({
        embed: {
          title: `${msg.emojis.pending}Are you sure you want to ban this image?`,
          image: { url },
          footer: { "text": m ? `Sent by ${m.author.tag} on ${m.createdAt.toLocaleString()}` : null },
          color: msg.colors.pending
        }
      });

      const confirmation = await message.prompt(msg.author.id).catch(e => ({ "error": e }));

      if (confirmation.error) return msg.cancelledCommand(`${msg.author.toString()} has failed to provide a response within **15** seconds, therefore I have cancelled the command!`);

      if (confirmation) {
        if (m) await m.delete().catch(() => { });

        try {
          if (!Filter.hash) await Filter.generateHash();
          await saveImage(Filter.hash);
          message.success(`This image has been successfully banned!`);
        } catch (error) {
          message.error(error, `ban this image!`);
        }

        await message.delete().catch(() => { });
      } else {
        return msg.cancelledCommand();
      }
    }

    async function saveImage(hash) {
      try {
        const guildData = {
          ...msg.guild.cache,
          imageHashes: []
        };

        if (msg.guild.cache.imageHashes) {
          for (const imageHash of msg.guild.cache.imageHashes) {
            guildData.imageHashes.push(imageHash);
          }
        }

        guildData.imageHashes.push(hash);

        await msg.client.db.update("guilds", guildData);

        return Promise.resolve(msg.guild.cache);
      } catch (error) {
        return Promise.reject(error.stack);
      }
    }
  }
};