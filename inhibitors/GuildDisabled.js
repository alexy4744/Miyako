
const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class GuildDisabled extends Inhibitor {
  run(msg, cmd) {
    if (!msg.guild || !msg.guild.cache || !msg.guild.cache.disabledCommands) return 1;
    if (msg.guild.cache.disabledCommands.includes(cmd.name)) return msg.fail(`Sorry ${msg.author.username}, this command is disabled in this guild!`);
    return 1;
  }
};