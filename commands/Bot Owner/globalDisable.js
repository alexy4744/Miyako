module.exports.run = async (client, msg, args) => {
  let cmd = args.join(" ");

  if (!client.commands.has(cmd) && !client.aliases.has(cmd)) return msg.fail(`"${cmd}" is not a valid command!`);

  cmd = client.commands.get(cmd) || client.aliases.get(cmd);

  const data = await client.db.get().catch(e => ({
    "error": e
  }));

  if (data.error) return msg.error(data.error, "globally disable this command!");

  if (!data.globallyDisabled) data.globallyDisabled = []; // Client data can't be null, so I don't need to check for !data

  if (data.globallyDisabled.includes(cmd.options.name)) return msg.fail(`"${cmd.options.name}" is already globally disabled!`);

  data.globallyDisabled.push(cmd.options.name);
  for (const alias of cmd.options.aliases) data.globallyDisabled.push(alias);

  return client.db.update({
    "globallyDisabled": data.globallyDisabled
  }).then(() => client.updateCache("globallyDisabled", data.globallyDisabled)
    .then(() => msg.success(`"${cmd.options.name}" is now globally disabled!`))
    .catch(e => msg.error(e, "globally disable this command!")))
    .catch(error => msg.error(error, "globally enable this command!"));
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: true,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: () => `Globally disable a command across all guilds`,
  usage: () => [`ping`],
  aliases: ["gdisable"],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};