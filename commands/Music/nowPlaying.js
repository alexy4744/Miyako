const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Show the currently playing song and it's progress.`,
      aliases: ["np"],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  async run(msg) {
    if (!msg.guild.player || (msg.guild.player && msg.guild.player.queue.length < 1)) return msg.fail(`There is nothing playing!`);

    const currSong = msg.guild.player.queue[0].info;
    const thumbnail = await this.client.player.getThumbnail(currSong);

    return msg.channel.send({
      embed: {
        title: `💽${msg.emojis.bar}Now Playing`,
        description: `**Title**: [**${currSong.title}**](${currSong.uri})`,
        thumbnail: { url: thumbnail },
        color: msg.colors.default
      }
    });
  }
};