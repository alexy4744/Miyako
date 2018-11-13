const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class RunIn extends Inhibitor {
  run(msg, cmd) {
    const runIn = cmd.runIn;
    const len = runIn.length;

    if (len < 1) return 1;

    const types = {
      "text": "text channels",
      "dm": "DMs"
    };

    for (let i = 0; i < len; i++) {
      if (msg.channel.type === runIn[i]) continue;
      return msg.fail(`This command can only be ran in ${types[cmd.runIn[i]]}!`);
    }

    return 1;
  }
};
