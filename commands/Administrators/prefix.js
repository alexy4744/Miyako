module.exports.run = async (client, msg, args) => {
  if (!args[0]) return msg.fail(`Please enter the new prefix that you want to re-assign to!`);

  const newPrefix = args.join(" ");

  if (newPrefix.length > 20) return msg.fail(`The length of this prefix is too long!`, `Prefixes can only have a max length of **20** characters!`);

  const data = await msg.guild.db.get().catch(e => ({
    "error": e
  }));

  if (data.error) return msg.error(data.error, "re-assign the prefix");

  // Default prefix is v$, so if there's no entry for this guild, then the prefix must be the default.
  if (((!data || !data.prefix) && newPrefix === client.prefix) || (data && data.prefix === newPrefix)) return msg.fail(`"${newPrefix}" is already the current prefix!`);

  return msg.guild.db.update({
    "prefix": newPrefix
  }).then(() => msg.guild.updateCache("prefix", newPrefix)
    .then(() => msg.success(`I have succesfully re-assigned the prefix to "${newPrefix}"`))
    .catch(e => msg.error(e, "re-assign the prefix")))
    .catch(e => msg.error(e, "re-assign the prefix"));
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