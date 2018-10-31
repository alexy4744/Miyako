const Command = require("../../modules/Base/Command");
const ImageFilter = require("../../modules/ImageFilter");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Add/remove items from filters.`,
      usage: () => [``],
      aliases: [],
      subcommands: {
        "word": ["add", "remove", "action", "sensitivity"],
        "image": ["add", "remove", "action"]
      },
      userPermissions: ["administrator"],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  async word(msg, subcommand, args) {
    if (!args[0]) return msg.fail("You must provide a word to add to the filter!");

    args = args.join(" ").toLowerCase();

    if (!msg.guild.cache.filterText) {
      try {
        await msg.guild.updateDatabase({
          filterText: {
            action: "delete",
            sensitivity: "default",
            words: []
          }
        });
        await msg.guild.syncDatabase(); // Use sync database so that the cache is updated instantly without waiting for the database watch event to fire.
      } catch (error) {
        return msg.error(error);
      }
    }

    const data = msg.guild.cache;

    this.add = () => {
      data.filterText.words.push(String(args));

      msg.guild.updateDatabase(data)
        .then(() => msg.success(`"${args}" has been added to the word filter!`))
        .catch(error => msg.error(error));
    };

    this.remove = () => {
      const index = data.filterText.words.findIndex(w => w === args);
      if (index < 0) return msg.fail(`"${args}" is not found in the word filter!`);

      data.filterText.words.splice(index, 1);

      msg.guild.updateDatabase(data)
        .then(() => msg.success(`"${args}" has been removed from the word filter!`))
        .catch(error => msg.error(error));
    };

    this.action = () => {
      // TODO: allow the word and to conjugate the command
      const actions = ["delete", "mute"];
      if (!actions.includes(args)) return msg.fail(`Invalid Action!`, `\`Available actions: ${actions.join(", ")}\``);

      data.filterText.action = args;

      msg.guild.updateDatabase(data)
        .then(() => msg.success(`Word filter action has been set to ${args.toUpperCase()}!`))
        .catch(error => msg.error(error));
    };

    this.sensitivity = () => {
      const sensitivities = ["high", "extreme"];
      if (!sensitivities.includes(args)) return msg.fail(`Invalid Sensitivity!`, `Available sensitivities: \`${sensitivities.join(", ")}\``);

      data.filterText.sensitivity = args;

      msg.guild.updateDatabase(data)
        .then(() => msg.success(`Word filter sensitivity has been set to ${args.toUpperCase()}!`))
        .catch(error => msg.error(error));
    };

    return this[subcommand]();
  }

  async image(msg, subcommand, args) {
    if (!msg.guild.cache.filterImage) {
      try {
        await msg.guild.updateDatabase({
          filterImage: {
            action: "delete",
            images: []
          }
        });
        await msg.guild.syncDatabase();
      } catch (error) {
        return msg.error(error);
      }
    }

    const attachment = args[0] ? { url: args[0] } : fetchLastImage();
    if (!attachment) return msg.fail(`I could not find any image attachments in the last couple of messages in this channel!`);

    const filter = new ImageFilter();
    const image = await filter.loadImage(attachment.url).catch(error => ({ error }));
    if (image.error) return msg.error(image.error, `failed to load this image!`);

    const data = msg.guild.cache;

    this.add = async () => {
      const confirmation = await prompt("Are you sure you want to add this image to the filter?");
      if (!confirmation) return;

      if (attachment.msg) attachment.msg.delete().catch(() => { });

      data.filterImage.images.push(filter.hash);

      msg.guild.updateDatabase(data)
        .then(() => msg.success(`This image has been successfully added to the filter!`))
        .catch(error => msg.error(error));
    };

    this.remove = async () => {
      const confirmation = await prompt("Are you sure you want to remove this image from the filter?");
      if (!confirmation) return;

      const index = msg.guild.cache.images.findIndex(hash => hash === filter.hash);
      if (index < 0) return msg.fail("This image was not found in the image filter!");

      data.filterImage.images.splice(index, 1);

      msg.guild.updateDatabase()
        .then(() => msg.success(`This image has been successfully removed from the filter!`))
        .catch(error => msg.error(error));
    };

    this.action = () => {
      // TODO: allow the word and to conjugate the command
      const actions = ["delete", "mute"];
      if (!actions.includes(args)) return msg.fail(`Invalid Action!`, `Available actions: ${actions.join(", ")}`);

      data.filterImage.action = args;

      msg.guild.updateDatabase(data)
        .then(() => msg.success(`Image filter action has been set to ${args.toUpperCase()}!`))
        .catch(error => msg.error(error));
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