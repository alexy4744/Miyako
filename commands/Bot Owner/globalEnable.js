module.exports.run = async (client, msg, args) => {
  let cmd = args[0];

  if (!client.commands.has(cmd) && !client.aliases.has(cmd)) return msg.fail(`"${cmd}" is not a valid command!`);

  cmd = client.commands.get(cmd) || client.aliases.get(cmd);

  const data = await client.db.get().catch(e => ({
    "error": e
  }));

  if (data.error) return msg.error(data.error, "globally enable this command!");

  if (!data.globallyDisabled) data.globallyDisabled = [];

  if (!data.globallyDisabled.includes(cmd.options.name)) return msg.fail(`"${cmd.options.name}" is already globally enabled!`);

  data.globallyDisabled = data.globallyDisabled.filter(command => !cmd.options.aliases.includes(command) && command !== args[0] && command !== cmd.options.name);

  return client.db.update({
    "globallyDisabled": data.globallyDisabled
  }).then(() => client.updateCache("globallyDisabled", data.globallyDisabled)
    .then(() => msg.success(`"${cmd.options.name}" is now globally enabled!`))
    .catch(e => msg.error(e, "globally enable this command!")))
    .catch(error => msg.error(error, "globally enable this command!"));
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: true,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: () => `Enable a globally disabled command`,
  usage: () => [`pong`],
  aliases: ["genable"],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};