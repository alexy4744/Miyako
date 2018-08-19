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
      description: () => `Pause a song that is currently playing.`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  run(msg) {
    if (!msg.guild.player || (msg.guild.player && msg.guild.player.queue.length < 1)) return msg.fail(`There is nothing to pause!`);
    if (!msg.guild.player.playing && msg.guild.player.paused) return msg.fail(`The player is already paused!`);

    this.client.player.pause(msg.guild);

    return msg.channel.send({
      embed: {
        title: `⏸${msg.emojis.bar}The player is now paused!`,
        color: msg.colors.default
      }
    });
  }
};