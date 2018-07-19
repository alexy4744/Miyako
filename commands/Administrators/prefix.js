module.exports.run = async (client, msg, args) => {
  if (!args[0]) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Please enter the new prefix that you want to re-assign to!`,
        color: msg.colors.fail
      }
    });
  }

  const newPrefix = args.join(" ");

  if (newPrefix.length > 20) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}The length of this prefix is too long!`,
        description: `Prefixes can only have a max length of **20** characters!`,
        color: msg.colors.fail
      }
    });
  }

  const data = await msg.guild.db.get().catch(e => msg.error(e, "re-assign the prefix"));

  // Default prefix is v$, so if there's no entry for this guild, then the prefix must be the default.
  if (((!data || !data.prefix) && newPrefix === client.prefix) || (data && data.prefix === newPrefix)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}"${newPrefix}" is already the current prefix!`,
        color: msg.colors.fail
      }
    });
  }

  msg.guild.db.update({
    prefix: newPrefix
  }).then(() => {
    msg.guild.updateCache("prefix", newPrefix).then(() => { // eslint-disable-line
      return msg.channel.send({
        embed: {
          title: `${msg.emojis.success}I have succesfully re-assigned the prefix to "${newPrefix}"`,
          color: msg.colors.success
        }
      });
    }).catch(e => msg.error(e, "re-assign the prefix"));
  }).catch(e => msg.error(e, "re-assign the prefix"));
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: msg => `Re-assign the prefix of ${msg.client.user.toString()}`,
  usage: () => [`v!`],
  aliases: [],
  userPermissions: ["administrator"],
  botPermissions: [],
  runIn: ["text"]
};