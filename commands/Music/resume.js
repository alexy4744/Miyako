/* eslint no-use-before-define: 0 */
/* eslint no-confusing-arrow: 0 */

const Music = require("../../modules/Music");

module.exports = class extends Music {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      checkVC: true,
      cooldown: 5,
      description: () => `Resume a song that is currently paused.`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  run(msg) {
    if (!msg.guild.player || (msg.guild.player && msg.guild.player.queue.length < 1)) return msg.fail(`There is nothing to resume!`);
    if (msg.guild.player.playing && !msg.guild.player.paused) return msg.fail(`The player is already playing!`);

    this.resume(msg.guild);

    return msg.channel.send({
      embed: {
        title: `⏯${msg.emojis.bar}The player has been resumed!`,
        color: msg.colors.default
      }
    });
  }
};