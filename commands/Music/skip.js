const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      checkVC: true,
      cooldown: 5,
      description: () => `Skip the song that is currently playing.`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  run(msg) {
    if (!msg.guild.player || (msg.guild.player && msg.guild.player.queue.length < 1)) return msg.fail(`There is nothing to skip!`);

    const songToSkip = msg.guild.player.queue[0];

    if (msg.guild.player.queue.length > 1) {
      this.client.player.skip(msg.guild);
    } else {
      this.client.player.stop(msg.guild);
      this.client.player.leave(msg.guild);
      this.client.player.join(msg);
      msg.guild.player.queue = [];
    }

    return msg.channel.send({
      embed: {
        title: `"${songToSkip.info.title}" has been skipped by ${msg.author.tag}!`,
        description: msg.guild.player.queue.length > 0 ? `Now Playing: **[${msg.guild.player.queue[0].info.title}](${msg.guild.player.queue[0].info.uri})**` : null,
        color: msg.colors.default
      }
    });
  }
};