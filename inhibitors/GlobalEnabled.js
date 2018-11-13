const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class GlobalEnabled extends Inhibitor {
  run(msg, cmd) {
    if (!cmd.enabled) return 0;

    if (!this.client.cache.global || !Array.isArray(this.client.cache.global.disabledCommands)) return 1;
    else if (!this.client.cache.global.disabledCommands.includes(cmd.name)) return 1;

    return 0;
  }
};