const Finalizer = require("../modules/Finalizer");

module.exports = class AddToCooldown extends Finalizer {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    if (msg.author.id === this.client.owner) return;
    msg.guild.userCooldowns.add(msg.author.id);
    setTimeout(() => msg.guild.userCooldowns.delete(msg.author.id), cmd.options.cooldown ? cmd.options.cooldown * 1000 : 5000);
  }
};