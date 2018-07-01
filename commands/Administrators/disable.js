module.exports.run = async (client, msg, args) => {
  if (!client.commands.has(args[0]) && !client.aliases.has(args[0])) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Please enter a valid command to be disabled!`,
        color: msg.colors.fail
      }
    });
  }

  let data = await msg.guild.db.get();

  if (!data || !data.disabledCommands) {
    await msg.guild.db.insert({
      id: msg.guild.id,
      disabledCommands: []
    });
    data = await msg.guild.db.get(); // reassign data with the updated object containing the disabledCommands array for this guild.
  } else if (data && data.disabledCommands.includes(args[0])) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}The command "${args[0]}" has already been disabled in this guild!`,
        color: msg.colors.fail
      }
    });
  }

  const cmd = client.commands.get(args[0]) || client.aliases.get(args[0]);

  // Only aliases has the parentCommand property, if it doesn't, that means args[0] is already the parentCommand.
  data.disabledCommands.push(cmd.parentCommand || args[0]);
  cmd.command.options.aliases.map(a => data.disabledCommands.push(a));

  await msg.guild.db.update({
    disabledCommands: data.disabledCommands
  });
};

module.exports.options = {
  enabled: true,
  guarded: true, // If the command can be disabled per guild
  description: "Disable commands for this guild",
  nsfw: false,
  aliases: [],
  botOwnerOnly: false,
  checkVC: false,
  disableCheck: false, // Overrides all other boolean
  userPermissions: ["administrator"],
  botPermissions: [],
  runIn: [],
  cooldown: 5
};