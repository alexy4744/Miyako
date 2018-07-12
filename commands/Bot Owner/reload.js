module.exports.run = (client, msg, args) => {
  const thingToReload = args.join(" ");

  if (client.commands.has(thingToReload) || client.aliases.has(thingToReload)) {
    try {
      let cmd = client.commands.get(thingToReload) || client.aliases.get(thingToReload);
      delete require.cache[require.resolve(`../${cmd.options.category}/${cmd.options.name}`)];
      client.commands.delete(cmd.options.name);
      for (const alias of cmd.options.aliases) client.aliases.delete(alias);

      const category = cmd.options.category;
      cmd = require(`../${cmd.options.category}/${cmd.options.name}`)

      cmd.options.name = thingToReload;
      cmd.options.category = category;

      client.commands.set(cmd.options.name, cmd);
      for (const alias of cmd.options.aliases) client.aliases.set(alias, cmd);
    } catch (error) {
      return msg.error(error, `reload this command!`);
    }
  } else if (client.inhibitors.has(thingToReload)) {
    try {
      delete require.cache[require.resolve(`../../inhibitors/${thingToReload}`)];
      client.inhibitors.delete(thingToReload);

      client.inhibitors.set(thingToReload, require(`../../inhibitors/${thingToReload}`));
    } catch (error) {
      return msg.error(error, `reload this inhibitor!`);
    }
  } else if (client.utils.hasOwnProperty(thingToReload)) {
    try {
      delete client.utils[thingToReload];
      delete require.cache[require.resolve(`../../utils/${thingToReload}`)];

      const util = require(`../../utils/${thingToReload}`);
      client.utils[thingToReload] = util;
    } catch (error) {
      return msg.error(error, `reload this utility!`);
    }
  } else {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}"${thingToReload}" is not a valid command, inhibitor or a utility!`,
        color: msg.colors.fail
      }
    });
  }

  return msg.channel.send({
    embed: {
      title: `${msg.emojis.success}"${thingToReload}" has been succesfully reloaded!`,
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
  description: "Reload commands, inhibitors and utilities",
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};
