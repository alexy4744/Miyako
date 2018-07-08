module.exports.run = async (client, msg) => {
  const data = await client.db.get().catch(error => msg.error(error, "activate/deactivate developer mode!"));

  if (!data.devMode) data.devMode = true;
  else data.devMode = false;

  client.db.update({
    devMode: data.devMode
  }).then(() => {
    client.updateCache("devMode", data.devMode).catch(e => msg.error(e, "activate/deactivate developer mode!"));
  }).catch(error => msg.error(error, "activate/deactivate developer mode!"));

  return msg.channel.send({
    embed: {
      title: `⚙${msg.emojis.bar}Developer Mode has been ${data.devMode === true ? `activated` : `deactivated`}!`,
      description: data.devMode ? `Commands will not respond to anyone except the bot owner, ${client.users.get(client.owner).toString()}.` : null,
      color: msg.colors.default
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
  description: "Enable developer mode.",
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};