const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class Permissions extends Inhibitor {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    const perms = cmd.botPermissions;

    if (msg.channel.type !== "text" || perms.length < 1) return 1;

    for (const perm of perms) {
      if (msg.guild.me.hasPermission(perm)) continue;

      return msg.fail(
        `${msg.emojis.fail}I do not have the permissions to run this command!`,
        `I need the permission \`${perm.toUpperCase()}\` in order for me to execute this command!`
      );
    }

    return 1;
  }
};
