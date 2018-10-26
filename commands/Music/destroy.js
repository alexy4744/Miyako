const Command = require("../../modules/Base/Command");

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
      description: () => `Destroys the player and resets the queue for this guild, then leaves the voice channel.`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  run(msg) {
    if (!msg.guild.player) return msg.fail(`There is no player for this guild!`);

    this.client.player.leave(msg.guild);
    this.client.player.destroy(msg.guild);

    return msg.channel.send({
      embed: {
        title: `💣${msg.emojis.bar}Poof, the player is now destroyed!`,
        color: msg.colors.pending
      }
    });
  }
};