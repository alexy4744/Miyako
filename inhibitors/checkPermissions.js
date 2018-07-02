module.exports = (client, msg, cmd) => {
  const perms = cmd.command.options.botPermissions;

  if (msg.channel.type !== "text" || perms.length < 1) return 1;

  const clientUser = msg.guild.member(client.user);

  for (let i = 0; i < perms.length; i++) {
    if (!clientUser.hasPermission(perms[i])) {
      return msg.channel.send({
        embed: {
          title: `${msg.emojis.fail}I do not have the permissions to run this command!`,
          description: `I need the permission \`${perms[i].toUpperCase()}\` in order for me to execute this command!`,
          color: msg.colors.fail
        }
      });
    } else return 1 // eslint-disable-line
  }
};
