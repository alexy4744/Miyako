
const Inhibitor = require("../modules/Inhibitor");

module.exports = class DeveloperMode extends Inhibitor {
  constructor(...args) {
    super(...args);
  }

  run(msg) {
    if (this.client.cache.devMode && msg.author.id !== this.client.owner) {
      return msg.fail(`Sorry ${msg.author.username}, I am currently in developer mode and cannot execute any commands for now!`);
    }

    return 1;
  }
};