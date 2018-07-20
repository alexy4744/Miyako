module.exports.run = async (client, msg, args) => {
  if (!client.commands.has(args[0]) && !client.aliases.has(args[0])) return msg.fail(`Please enter a valid command to be enabled!`);

  let data = await msg.guild.db.get().catch(e => ({
    "error": e
  }));

  if (data.error) return msg.error(data.error, "enable this command");

  if (!data || !data.disabledCommands) {
    data = {
      "id": msg.guild.id,
      "disabledCommands": []
    };
  }

  // No need to check aliases, etc because if a command is disabled, it's parent name and aliases will be in this array.
  if (!data.disabledCommands.includes(args[0])) return msg.fail(`${msg.author.username}, "${args[0]}" is already enabled!`);

  const cmd = client.commands.get(args[0]) || client.aliases.get(args[0]);
  // Filter the array currently stored in the db, so that it does not contain the command aliases or the name
  const filteredCommands = data.disabledCommands.filter(command => !cmd.options.aliases.includes(command) && command !== args[0] && command !== cmd.options.name);

  return msg.guild.db.update({
    "disabledCommands": filteredCommands
  }).then(() => msg.guild.updateCache("disabledCommands", filteredCommands)
    .then(() => msg.success(`I have successfully enabled "${args[0]}"`))
    .catch(e => msg.error(e, "enable this command")))
    .catch(e => msg.error(e, "enable this command"));
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: msg => `Enable already-disabled commands in ${msg.guild.name}`,
  usage: () => [`ping`],
  aliases: [],
  userPermissions: ["administrator"],
  botPermissions: [],
  runIn: ["text"]
};