module.exports = (client, msg, cmd) => {
  const perms = cmd.options.userPermissions;

  if (msg.channel.type !== "text" || perms.length < 1) return 1;

  const member = msg.guild.member(msg.author);

  for (let i = 0; i < perms.length; i++) {
    if (!member.hasPermission(perms[i])) {
      return msg.channel.send({
        embed: {
          title: `${msg.emojis.fail}You do not have the permissions to run this command!`,
          description: `You must have the permission \`${perms[i].toUpperCase()}\` in order to execute this command!`,
          color: msg.colors.fail
        }
      });
    } else return 1;  // eslint-disable-line
  }
};