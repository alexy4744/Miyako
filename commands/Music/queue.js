const Command = require("../../modules/Command");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Show the current song queue.`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  async run(msg) {
    if (!msg.guild.player || (msg.guild.player && msg.guild.player.queue.length < 1)) return msg.fail(`There is nothing playing!`);

    const pages = [];
    const thumbnail = await this.client.player.getThumbnail(msg.guild.player.queue[0].info);

    for (let i = 0, j = 0; i < msg.guild.player.queue.length; i += 10) {
      const message = new MessageEmbed()
        .setTitle(`\\🎵${msg.emojis.bar}Track List`)
        .setDescription(msg.guild.player.queue.slice(i, i + 10).map(t => `**${++j}**: [**${t.info.title}**](${t.info.uri})`))
        .setColor(msg.colors.default)
        .setThumbnail(thumbnail);

      pages.push(message);
    }

    return msg.paginate(pages);
  }
};