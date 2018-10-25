const Inhibitor = require("../modules/Inhibitor");

module.exports = class UserPermissions extends Inhibitor {
  constructor(...args) {
    super(...args);
  }

  run(msg, cmd) {
    const perms = cmd.options.userPermissions;
    if (msg.author.id === this.client.owner) return 1;

    if (msg.channel.type !== "text" || perms.length < 1) return 1;

    for (let i = 0; i < perms.length; i++) {
      if (msg.member.hasPermission(perms[i])) continue;
      return msg.fail(
        `${msg.emojis.fail}You do not have the permissions to run this command!`,
        `You must have the permission \`${perms[i].toUpperCase()}\` in order to execute this command!`
      );
    }

    return 1;
  }
};
