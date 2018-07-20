module.exports.run = async (client, msg) => {
  const data = await client.db.get().catch(e => ({
    "error": e
  }));

  if (data.error) return msg.error(data.error, "activate/deactivate developer mode!");

  if (!data.devMode) data.devMode = true;
  else data.devMode = false;

  return client.db.update({
    devMode: data.devMode
  }).then(() => client.updateCache("devMode", data.devMode)
    .then(() => msg.channel.send({
      embed: {
        title: `⚙${msg.emojis.bar}Developer Mode has been ${data.devMode === true ? `activated` : `deactivated`}!`,
        description: data.devMode ? `Commands will not respond to anyone except the bot owner, ${client.users.get(client.owner).toString()}.` : null,
        color: msg.colors.default
      }
    }))
    .catch(e => msg.error(e, "activate/deactivate developer mode!")))
    .catch(error => msg.error(error, "activate/deactivate developer mode!"));
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: true,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: () => `Activate developer mode to prevent anyone else to execute commands except the bot owner`,
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};