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

  word(msg, subcommand, args) {
    this.add = () => {
      console.log("add")
    };

    this.remove = () => {
      console.log("remove")
    };

    return this[subcommand]();
  }

  image(msg, subcommand, args) {
    this.add = () => {
      if (args[0]) return validateImage(args[0]);

      const attachment = fetchLastImage();

      if (!attachment) return msg.fail(`I could not find any image attachments in the last couple of messages in this channel!`);

      return validateImage(attachment.attachment, attachment.msg);

      async function validateImage(url, m) {
        const Filter = new ImageFilter();
        const image = await Filter.loadImage(url).catch(e => ({ "error": e }));

        if (image.error) return msg.error(image.error, `ban this image!`);

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

          await this._updateDatabase(msg, guildData);

          return Promise.resolve(msg.guild.cache);
        } catch (error) {
          return Promise.reject(error.stack);
        }
      }
    };

    this.remove = () => {

    };

    function fetchLastImage() {
      const attachments = msg.channel.messages.filter(m => m.attachments.size > 0);

      if (attachments.size < 1) return null;

      return {
        message: attachments.last(),
        attachment: attachments.last().attachments.first().url
      };
    }

    return this[subcommand]();
  }

  async _updateDatabase(msg, data) {
    try {
      await msg.client.db.update("guilds", data);
      return Promise.resolve(msg.guild.cache);
    } catch (error) {
      return Promise.reject(error.stack);
    }
  }
};