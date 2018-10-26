const Event = require("../modules/Base/Event");

module.exports = class Error extends Event {
  constructor(...args) {
    super(...args);
  }

  run(error) {
    return console.error(error);
  }
};