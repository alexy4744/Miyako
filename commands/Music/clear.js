const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      checkVC: true,
      checkDJ: true,
      cooldown: 5,
      description: () => `Clears the current song queue.`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  run(msg) {
    if (!msg.guild.player || (msg.guild.player && msg.guild.player.queue.length < 1)) return msg.fail(`There is nothing in the queue to clear!`);

    this.client.player.stop(msg.guild);

    msg.guild.player.queue = [];

    return msg.channel.send({
      embed: {
        title: `⚡${msg.emojis.bar}The queue has been cleared!`,
        color: msg.colors.pending
      }
    });
  }
};