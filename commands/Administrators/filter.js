/* eslint no-use-before-define: 0 */

const Command = require("../../modules/Base/Command");
const ImageFilter = require("../../modules/ImageFilter");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Add/remove items from filters.`,
      usage: () => [``],
      aliases: [],
      subcommands: {
        "word": ["add", "remove"],
        "image": ["add", "remove"]
      },
      userPermissions: ["administrator"],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  async word(msg, subcommand, args) {
    if (!args[0]) return msg.fail("You must provide a word to add to the filter!");

    const word = args.join(" ");

    if (!(msg.guild.cache.words instanceof Array)) {
      try {
        await this.client.db.update("guilds", {
          _id: msg.guild.id,
          words: []
        });
      } catch (error) {
        return msg.error(error);
      }
    }

    /* Use sync database so that the cache is updated instantly without waiting for the database watch event to fire. */
    let data = msg.guild.cache;
    if (!data.words) data = await msg.guild.syncDatabase();

    this.add = async () => {
      try {
        data.words.push(word);
        await this.client.db.update("guilds", data);
        return msg.success(`"${word}" has been added to the word filter!`);
      } catch (error) {
        return msg.error(error);
      }
    };

    this.remove = async () => {
      try {
        const index = data.words.findIndex(w => w === word);
        if (index < 0) return msg.fail(`"${word}" is not found in the word filter!`);

        data.words.splice(index, 1);
        await this.client.db.update("guilds", data);

        return msg.success(`"${word}" has been removed from the word filter!`);
      } catch (error) {
        return msg.error(error);
      }
    };

    return this[subcommand]();
  }

  async image(msg, subcommand, args) {
    if (!(msg.guild.cache.images instanceof Array)) {
      try {
        await this.client.db.update("guilds", {
          _id: msg.guild.id,
          images: []
        });
      } catch (error) {
        return msg.error(error);
      }
    }

    const attachment = args[0] ? { url: args[0] } : fetchLastImage();
    if (!attachment) return msg.fail(`I could not find any image attachments in the last couple of messages in this channel!`);

    const Filter = new ImageFilter();
    const image = await Filter.loadImage(attachment.url).catch(error => ({ error }));

    if (image.error) return msg.error(image.error, `failed to load this image!`);

    let data = msg.guild.cache;
    if (!data.images) data = await msg.guild.syncDatabase();

    this.add = async () => {
      const confirmation = await prompt("Are you sure you want to add this image to the filter?");
      if (!confirmation) return;

      if (attachment.msg) attachment.msg.delete().catch(() => { });

      try {
        if (!Filter.hash) await Filter.generateHash();

        data.images.push(Filter.hash);

        await msg.client.db.update("guilds", data);

        return msg.success(`This image has been successfully added to the filter!`);
      } catch (error) {
        return msg.error(error.stack);
      }
    };

    this.remove = async () => {
      const confirmation = await prompt("Are you sure you want to remove this image from the filter?");
      if (!confirmation) return;

      try {
        if (!Filter.hash) await Filter.generateHash();

        const index = msg.guild.cache.images.findIndex(hash => hash === Filter.hash);
        if (index < 0) return msg.fail("This image was not found in the image filter!");

        data.images.splice(index, 1);

        await msg.client.db.update("guilds", data);

        return msg.success(`This image has been successfully removed from the filter!`);
      } catch (error) {
        return msg.error(error.stack);
      }
    };

    function fetchLastImage() {
      const attachments = msg.channel.messages.filter(m => m.attachments.size > 0);

      if (attachments.size < 1) return null;

      return {
        msg: attachments.last(),
        url: attachments.last().attachments.first().url
      };
    }

    async function prompt(title) {
      const message = await msg.channel.send({
        embed: {
          title: `${msg.emojis.pending}${title}`,
          image: { url: attachment.url },
          footer: { "text": attachment.msg ? `Sent by ${attachment.msg.author.tag} on ${attachment.msg.createdAt.toLocaleString()}` : null },
          color: msg.colors.pending
        }
      });

      const confirmation = await message.prompt(msg.author.id).catch(error => ({ error }));

      if (confirmation.error) {
        msg.cancelledCommand(`${msg.author.toString()} has failed to provide a response within **15** seconds, therefore I have cancelled the command!`);
        return Promise.resolve(false);
      }

      if (confirmation) {
        message.delete().catch(() => { });
        return Promise.resolve(true);
      }

      msg.cancelledCommand();
      return Promise.resolve(false);
    }

    return this[subcommand]();
  }
};