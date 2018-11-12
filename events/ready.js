const Event = require("../modules/Base/Event");
const chalk = require("chalk");
const Stopwatch = new (require("../modules/Stopwatch"))();

module.exports = class Ready extends Event {
  constructor(...args) {
    super(...args);
  }

  async run() {

  }
};
