module.exports.run = async (client, msg, args) => {
  let cmd = args.join(" ");

  if (!client.commands.has(cmd) && !client.aliases.has(cmd)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}"${cmd}" is not a valid command!`,
        color: msg.colors.fail
      }
    });
  }

  cmd = client.commands.get(cmd) || client.aliases.get(cmd);

  const data = await client.db.get().catch(error => msg.error(error, "globally disable this command!"));

  if (data.globallyDisabled.includes(cmd.options.name)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}"${cmd.options.name}" is already globally disabled!`,
        color: msg.colors.fail
      }
    });
  }

  if (!data || !data.globallyDisabled) data.globallyDisabled = [];
  data.globallyDisabled.push(cmd.options.name);
  for (const alias of cmd.options.aliases) data.globallyDisabled.push(alias);

  client.db.update({
    globallyDisabled: data.globallyDisabled
  }).then(() => {
    client.updateCache("globallyDisabled", data.globallyDisabled).catch(e => msg.error(e, "globally disable this command!"));
  }).catch(error => msg.error(error, "globally enable this command!"));

  return msg.channel.send({
    embed: {
      title: `${msg.emojis.success}"${cmd.options.name}" is now globally disabled!`,
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
  aliases: ["gdisable"],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};