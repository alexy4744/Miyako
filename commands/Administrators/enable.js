module.exports.run = async (client, msg, args) => {
  const command = args.join(" ");
  const cmd = client.commands.get(command) || client.aliases.get(command);
};

module.exports.options = {
  enabled: true,
  guarded: false, // If the command can be disabled per guild
  description: "Check the latency between the bot and Discord servers.",
  nsfw: false,
  aliases: ["latency", "pong"],
  botOwnerOnly: false,
  checkVC: false,
  disableCheck: true, // Overrides all other boolean
  userPermissions: [],
  botPermissions: [],
  runIn: [],
  cooldown: 5
};