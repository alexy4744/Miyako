const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class NSFW extends Inhibitor {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    if (msg.channel.type !== "text") return 1;
    if (!msg.channel.nsfw && cmd.options.nsfw) return msg.fail(`${msg.emojis.fail}I cannot run this command in non-NSFW channels!`);
    return 1;
  }
};