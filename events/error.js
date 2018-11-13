const Event = require("../modules/Base/Event");

module.exports = class Error extends Event {
  run(error) {
    return console.error(error);
  }
};