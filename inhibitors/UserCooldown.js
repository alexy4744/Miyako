const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class UserCooldown extends Inhibitor {
  async run(msg, cmd) {
    if (!cmd.cooldown || cmd.cooldown < 1 || !msg.author.cooldown) return 1;

    try {
      const message = await msg.channel.send(`${msg.author.toString()}, wait ${msg.author.cooldown} seconds before executing commands again!`);
      setTimeout(() => message.delete(), 10000);
    } catch (error) {
      // noop
    }
  }
};
