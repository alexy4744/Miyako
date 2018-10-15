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

  run(msg, args) {
    if (!msg.guild.player || (msg.guild.player && msg.guild.player.queue.length < 1)) return msg.fail(`There is nothing to skip!`);

    const songToSkip = msg.guild.player.queue[0];
    const amount = args[0] ? parseInt(args[0]) : 1;

    if (msg.guild.player.queue.length > 1) {
      if (amount === 1) {
        this.client.player.skip(msg.guild);
      } else {
        msg.guild.player.queue = msg.guild.player.queue.slice(amount);
        this.client.player.play(msg.guild);
      }
    } else {
      this.client.player.stop(msg.guild);
      msg.guild.player.queue = [];
    }

    return msg.channel.send({
      embed: {
        title: `⏭${msg.emojis.bar}"${songToSkip.info.title}" has been skipped by ${msg.author.tag}!`,
        description: msg.guild.player.queue.length > 0 ? `Now Playing: **[${msg.guild.player.queue[0].info.title}](${msg.guild.player.queue[0].info.uri})**` : null,
        color: msg.colors.default
      }
    });
  }
};