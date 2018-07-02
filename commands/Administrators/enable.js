module.exports.run = async (client, msg, args) => {
  if (!client.commands.has(args[0]) && !client.aliases.has(args[0])) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Please enter a valid command to be enabled!`,
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
    data = await msg.guild.db.get(); // Re-assign data with the updated object containing the disabledCommands array for this guild.
  } else if (data && !data.disabledCommands.includes(args[0])) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}The command "${args[0]}" is already enabled in this guild!`,
        color: msg.colors.fail
      }
    });
  }

  const cmd = client.commands.get(args[0]) || client.aliases.get(args[0]);
  const aliases = cmd.command.options.aliases;
  // Filter the array currently stored in the db, so that it does not contain the command aliases or the name of it's parent command.
  const filteredCommands = data.disabledCommands.filter(command => !aliases.includes(command) && command !== args[0] && command !== cmd.parentCommand);

  await msg.guild.db.update({
    disabledCommands: filteredCommands
  }).catch(error => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to enable this command!`,
      description: `\`\`\`js\n${error}\n\`\`\``,
      color: msg.colors.fail
    }
  }));

  if (msg.guild.disabledCommands) msg.guild.disabledCommands = filteredCommands; // Update the cache of disabled commands for this guild.

  return msg.channel.send({
    embed: {
      title: `${msg.emojis.success}I have succesfully enabled "${args[0]}"`,
      color: msg.colors.success
    }
  });
};

module.exports.options = {
  enabled: true,
  guarded: true, // If the command can be disabled per guild
  description: "Enable disabled commands for this guild",
  nsfw: false,
  aliases: [],
  botOwnerOnly: false,
  checkVC: false,
  userPermissions: ["administrator"],
  botPermissions: [],
  runIn: [],
  cooldown: 5
};