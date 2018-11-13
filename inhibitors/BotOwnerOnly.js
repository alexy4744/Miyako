const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class BotOwnerOnly extends Inhibitor {
  run(msg, cmd) {
    if (!cmd.botOwnerOnly || (msg.author.id === this.client.owner && cmd.botOwnerOnly)) return 1;
    return 0;
  }
};