const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class DJ extends Inhibitor {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    if (!msg.guild.cache || !msg.guild.cache.djs || msg.guild.cache.djs.length < 1 || !cmd.options.checkDJ) return 1;
    for (const dj of msg.guild.cache.djs) if (dj === msg.author.id) return 1;

    return msg.fail("You must be a DJ in order to execute this command!");
  }
};