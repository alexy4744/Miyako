const Finalizer = require("../modules/Base/Finalizer");

module.exports = class AddToCooldown extends Finalizer {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    if (msg.author.id === this.client.owner) return;

    if (msg.guild) {
      msg.guild.userCooldowns.add(msg.author.id);
      return setTimeout(() => msg.guild.userCooldowns.delete(msg.author.id), cmd.cooldown * 1000);
    }

    msg.author.cooldown = true;
    return setTimeout(() => msg.author.cooldown = false, cmd.cooldown * 1000);
  }
};