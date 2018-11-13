const Inhibitor = require("../modules/Base/Inhibitor");

module.exports = class UserPermissions extends Inhibitor {
  run(msg, cmd) {
    const perms = cmd.userPermissions;
    if (msg.author.id === this.client.owner) return 1;

    if (msg.channel.type !== "text" || perms.length < 1) return 1;

    for (const perm of perms) {
      if (msg.member.hasPermission(perm.toUpperCase())) continue;

      return msg.fail(
        `You do not have the permissions to run this command!`,
        `You must have the permission \`${perm.toUpperCase()}\` in order to execute this command!`
      );
    }

    return 1;
  }
};
