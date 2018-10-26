const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class BotOwnerOnly extends Inhibitor {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    if (!cmd.options.botOwnerOnly || (msg.author.id === this.client.owner && cmd.options.botOwnerOnly)) return 1;
    return 0;
  }
};