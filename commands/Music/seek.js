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
      description: () => `Set the volume of the player.`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  run(msg, args) {
    if (!msg.guild.player || (msg.guild.player && msg.guild.player.queue.length < 1)) return msg.fail(`There is nothing playing!`);
    if (!args[0]) return msg.fail(`Please enter the time that you want to seek the song to!`);

    let time = args[0];

    if (this.client.utils.stringToMillis.isValid(args[0])) time = this.client.utils.stringToMillis.convert(args[0]).ms;
    else if (isNaN(time)) return msg.fail(`Please enter the a valid time format or milliseconds in order to seek!`);

    if (time > msg.guild.player.queue[0].info.length) {
      this.client.player.skip(msg.guild);
      return msg.channel.send({
        embed: {
          title: `⏭${msg.emojis.bar}I have skipped the current song!`,
          color: msg.colors.default
        }
      });
    }

    this.client.player.seek(msg.guild, time);

    return msg.channel.send({
      embed: {
        title: `⏩${msg.emojis.bar}I have seeked "${msg.guild.player.queue[0].info.title}" to ${args[0]}`,
        color: msg.colors.default
      }
    });
  }
};