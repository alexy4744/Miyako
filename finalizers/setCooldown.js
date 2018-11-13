const Finalizer = require("../modules/Base/Finalizer");

module.exports = class SetCooldown extends Finalizer {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    if (msg.author.id === this.client.owner || msg.author.cooldown) return;

    msg.author.cooldown = cmd.cooldown;
    setTimeout(() => msg.author.cooldown = null, cmd.cooldown * 1000);
  }
};