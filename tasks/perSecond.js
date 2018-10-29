const Task = require("../modules/Base/Task");

module.exports = class PerSecond extends Task {
  constructor(...args) {
    super(...args, {
      interval: 1000
    });
  }

  run() {
    this.client.messagesPerSecond = 0;
    this.client.commandsPerSecond = 0;
  }
};