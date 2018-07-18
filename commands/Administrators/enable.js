module.exports.run = async (client, msg, args) => {
  if (!client.commands.has(args[0]) && !client.aliases.has(args[0])) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Please enter a valid command to be enabled!`,
        color: msg.colors.fail
      }
    });
  }

  let data = await msg.guild.db.get().catch(e => msg.error(e, "enable this command"));

  if (!data || !data.disabledCommands) {
    await msg.guild.db.update({
      disabledCommands: []
    }).catch(e => msg.error(e, "enable this command"));
    await msg.guild.updateCache("disabledCommands", []).catch(e => msg.error(e, "disable this command"));
    data = await msg.guild.db.get().catch(e => msg.error(e, "enable this command")); // Re-assign data with the updated object containing the disabledCommands array for this guild.
  } else if (data && !data.disabledCommands.includes(args[0])) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}"${args[0]}" is already enabled in this guild!`,
        color: msg.colors.fail
      }
    });
  }

  const cmd = client.commands.get(args[0]) || client.aliases.get(args[0]);
  // Filter the array currently stored in the db, so that it does not contain the command aliases or the name of it's parent command.
  const filteredCommands = data.disabledCommands.filter(command => !cmd.options.aliases.includes(command) && command !== args[0] && command !== cmd.options.name);

  msg.guild.db.update({
    disabledCommands: filteredCommands
  }).then(() => {
    msg.guild.updateCache("disabledCommands", filteredCommands).then(() => { // eslint-disable-line
      return msg.channel.send({
        embed: {
          title: `${msg.emojis.success}I have succesfully enabled "${args[0]}"`,
          color: msg.colors.success
        }
      });
    }).catch(e => msg.error(e, "enable this command"));
  }).catch(e => msg.error(e, "enable this command"));
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