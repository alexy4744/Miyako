const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class UserCooldown extends Inhibitor {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    if (!cmd.options.cooldown || cmd.options.cooldown < 1 || !msg.guild.userCooldowns.has(msg.author.id)) return 1;

    return msg.channel
      .send(`${msg.author.toString()}, wait ${cmd.options.cooldown} seconds before executing commands again!`)
      .then(m => setTimeout(() => m.delete().catch(() => { }), 10000))
      .catch(() => { });
  }
};
