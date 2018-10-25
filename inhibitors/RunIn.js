const Inhibitor = require("../modules/Inhibitor");

module.exports = class RunIn extends Inhibitor {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    const runIn = cmd.options.runIn;
    const len = runIn.length;

    if (len < 1) return 1;

    const types = {
      "text": "text channels",
      "dm": "DMs"
    };

    for (let i = 0; i < len; i++) {
      if (msg.channel.type === runIn[i]) continue;
      return msg.fail(`This command can only be ran in ${types[cmd.options.runIn[i]]}!`);
    }

    return 1;
  }
};
