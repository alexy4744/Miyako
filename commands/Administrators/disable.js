module.exports.run = async (client, msg, args) => {
  if (!client.commands.has(args[0]) && !client.aliases.has(args[0])) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Please enter a valid command to be disabled!`,
        color: msg.colors.fail
      }
    });
  }

  const cmd = client.commands.get(args[0]) || client.aliases.get(args[0]);

  if (cmd.options.guarded) { // Check if the command can be disabled per guild.
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}This command cannot be disabled!`,
        color: msg.colors.fail
      }
    });
  }

  let data = await msg.guild.db.get().catch(e => msg.error(e, "disable this command"));

  if (!data || !data.disabledCommands) {
    await msg.guild.db.update({
      disabledCommands: []
    }).catch(e => msg.error(e, "disable this command"));
    data = await msg.guild.db.get().catch(e => msg.error(e, "disable this command")); // reassign data with the updated object containing the disabledCommands array for this guild.
  } else if (data && data.disabledCommands.includes(args[0])) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}"${args[0]}" has already been disabled in this guild!`,
        color: msg.colors.fail
      }
    });
  }

  data.disabledCommands.push(cmd.options.name || args[0]);
  cmd.options.aliases.forEach(a => data.disabledCommands.push(a));

  msg.guild.db.update({
    disabledCommands: data.disabledCommands
  }).then(() => {
    msg.guild.updateCache("disabledCommands", data.disabledCommands).then(() => { // eslint-disable-line
      console.timeEnd("run time");
      return msg.channel.send({
        embed: {
          title: `${msg.emojis.success}I have successfully disabled the command "${args[0]}"`,
          color: msg.colors.success
        }
      });
    }).catch(e => msg.error(e, "disable this command"));
  }).catch(e => msg.error(e, "disable this command"));
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: "Disable commands for this guild.",
  aliases: [],
  userPermissions: ["administrator"],
  botPermissions: [],
  runIn: ["text"]
};