module.exports.run = async (client, msg, args) => {
  let cmd = args[0];

  if (!client.commands.has(cmd) && !client.aliases.has(cmd)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}${cmd} is not a valid command!`,
        color: msg.colors.fail
      }
    });
  }

  cmd = client.commands.get(cmd) || client.aliases.get(cmd);

  const data = await client.db.get().catch(error => msg.error(error, "globally enable this command!"));

  if (!data.globallyDisabled.includes(cmd.options.name)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}"${cmd.options.name}" is already globally enabled!`,
        color: msg.colors.fail
      }
    });
  }

  if (!data || !data.globallyDisabled) data.globallyDisabled = [];
  data.globallyDisabled = data.globallyDisabled.filter(command => !cmd.options.aliases.includes(command) && command !== args[0] && command !== cmd.options.name);

  client.db.update({
    globallyDisabled: data.globallyDisabled
  }).then(() => {
    client.updateCache("globallyDisabled", data.globallyDisabled).catch(e => msg.error(e, "globally enable this command!"));
  }).catch(error => msg.error(error, "globally enable this command!"));

  return msg.channel.send({
    embed: {
      title: `${msg.emojis.success}"${cmd.options.name}" is now globally enabled!`,
      color: msg.colors.success
    }
  });
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: true,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: "Globally disable a command",
  aliases: ["genable"],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};