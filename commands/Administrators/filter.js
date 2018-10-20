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
      description: () => `Add/remove items from filters.`,
      usage: () => [``],
      aliases: [],
      subcommands: [
        {
          "word": ["add", "remove"]
        },
        {
          "image": ["add", "remove"]
        }
      ],
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

    this.add = async () => {
      try {
        let data = msg.guild.cache;
        if (!data.words) data = await msg.guild.syncDatabase();

        data.words.push(word);

        await this.client.db.update("guilds", data);

        return msg.success(`"${word}" has been added to the word filter!`);
      } catch (error) {
        return msg.error(error);
      }
    };

    this.remove = async () => {
      try {
        let data = msg.guild.cache;
        if (!data.words || (data.words && !data.words.includes(word))) data = await msg.guild.syncDatabase();

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

    this.add = () => {
      return validateImage(attachment.url, attachment.msg);

      async function validateImage(url, m) {
        const Filter = new ImageFilter();
        const image = await Filter.loadImage(url).catch(error => ({ error }));

        if (image.error) return msg.error(image.error, `remove this image from the filter!`);

        const message = await msg.channel.send({
          embed: {
            title: `${msg.emojis.pending}Are you sure you want to ban this image?`,
            image: { url },
            footer: { "text": m ? `Sent by ${m.author.tag} on ${m.createdAt.toLocaleString()}` : null },
            color: msg.colors.pending
          }
        });

        const confirmation = await message.prompt(msg.author.id).catch(error => ({ error }));

        if (confirmation.error) return msg.cancelledCommand(`${msg.author.toString()} has failed to provide a response within **15** seconds, therefore I have cancelled the command!`);

        if (confirmation) {
          if (m) m.delete().catch(() => { });

          try {
            if (!Filter.hash) await Filter.generateHash();

            let data = msg.guild.cache;
            if (!data.images) data = await msg.guild.syncDatabase();

            data.images.push(Filter.hash);

            await msg.client.db.update("guilds", data);

            message.success(`This image has been successfully added to the filter!`);
          } catch (error) {
            message.error(error.stack);
          }

          message.delete().catch(() => { });
        } else {
          return msg.cancelledCommand();
        }
      }
    };

    this.remove = async () => {
      const Filter = new ImageFilter();
      const image = await Filter.loadImage(attachment.url).catch(error => ({ error }));

      if (image.error) return msg.error(image.error, `remove this image from the filter!`);

      try {
        if (!Filter.hash) await Filter.generateHash();

        let data = msg.guild.cache;
        if (!data.images) data = await msg.guild.syncDatabase();

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

    return this[subcommand]();
  }
};