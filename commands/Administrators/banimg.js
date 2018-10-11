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

      const Filter = new ImageFilter(url);
      const image = await Filter.init().catch(e => ({ "error": e }));

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
        if (m) await m.delete().catch(() => { });

        try {
          if (!Filter.hash) await Filter.generateHash();
          if (!Filter.buffer) await Filter.getBuffer();
          await saveImage(Filter.hash, Filter.buffer);
          message.success(`This image has been successfully banned!`);
        } catch (error) {
          message.error(error, `ban this image!`);
        }

        await message.delete().catch(() => { });
      } else {
        return msg.cancelledCommand();
      }
    }

    async function saveImage(hash, buffer) {
      try {
        if (!msg.guild.cache.imageHashes) await msg.client.db.update("guilds", { ...msg.guild.cache, "imageHashes": [] });
        if (!msg.guild.cache.imageBuffers) await msg.client.db.update("guilds", { ...msg.guild.cache, "imageBuffers": [] });

        if (!msg.guild.cache.imageHashes || !(msg.guild.cache.imageHashes instanceof Array)) await msg.client.db.update("guilds", { ...msg.guild.cache, "imageHashes": [] });
        if (!msg.guild.cache.imageBuffers || !(msg.guild.cache.imageBuffers instanceof Array)) await msg.client.db.update("guilds", { ...msg.guild.cache, "imageBuffers": [] });

        await msg.client.db.update("guilds", {
          ...msg.guild.cache,
          "imageHashes": [...msg.guild.cache.imageHashes, hash], // append to the array with the spread operator
          "imageBuffers": [...msg.guild.cache.imageBuffers, buffer]
        });

        return Promise.resolve(msg.guild.cache);
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }
};