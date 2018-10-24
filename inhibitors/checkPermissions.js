module.exports = (client, msg, cmd) => {
  const perms = cmd.options.botPermissions;

  if (msg.channel.type !== "text" || perms.length < 1) return 1;

  for (const perm of perms) {
    if (!msg.guild.me.hasPermission(perm)) {
      return msg.channel.send({
        embed: {
          title: `${msg.emojis.fail}I do not have the permissions to run this command!`,
          description: `I need the permission \`${perm.toUpperCase()}\` in order for me to execute this command!`,
          color: msg.colors.fail
        }
      });
    } else return 1 // eslint-disable-line
  }
};
