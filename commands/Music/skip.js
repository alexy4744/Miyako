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

    msg.guild.player.queue.shift();

    if (msg.guild.player.queue.length > 0) {
      this.client.player.play(msg.guild, msg.guild.player.queue[0].track);

      msg.channel.send({
        embed: {
          title: `"${songToSkip.info.title}" has been skipped by ${msg.author.tag}!`,
          description: `Now Playing: **[${msg.guild.player.queue[0].info.title}](${msg.guild.player.queue[0].info.uri})**`,
          color: msg.colors.default
        }
      });
    } else {
      return msg.fail(`There are no songs in the queue to skip!`);
    }
  }
};