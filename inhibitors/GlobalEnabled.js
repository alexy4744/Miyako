const Inhibitor = require("../modules/Inhibitor");

module.exports = class GlobalEnabled extends Inhibitor {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    if (!cmd.options.enabled) return 0;

    if (!this.client.cache.global || !Array.isArray(this.client.cache.global.disabledCommands)) return 1;
    else if (!this.client.cache.global.disabledCommands.includes(cmd.options.name)) return 1;

    return 0;
  }
};