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
    if (!args[0]) return msg.fail(`Please supply me with the volume you want it to be adjusted to!`);
    if (isNaN(args[0])) return msg.fail(`Please supply a number within the range of 0-150!`);
    if (args[0] > 150) return msg.fail(`You cannot exceed a volume of 150%`);

    this.client.player.volume(msg.guild, args[0]);

    return msg.channel.send({
      embed: {
        title: `${args[0] < 1 ? `🔇` : args[0] <= 50 ? `🔉` : `🔊`}${msg.emojis.bar}I have set the volume to ${args[0]}%`,
        color: msg.colors.default
      }
    });
  }
};