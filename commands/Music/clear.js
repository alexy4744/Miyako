module.exports.run = (client, msg) => {
  client.LePlayer.clear(msg.guild.id).then(async () => {
    await client.LePlayer.join(msg).catch(async () => { // Leave the voice channel as a fallback
      await client.LePlayer.leave(msg.guild.id).catch(() => {}); // If an error occurs leaving the voice channel, do nothing.
    });

    return msg.channel.send({
      embed: {
        title: `💥${msg.emojis.bar}I have succesfully cleared the queue!`,
        color: msg.colors.success
      }
    });
  }).catch(e => msg.error(e, "clear the queue!"));
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: true,
  cooldown: 5,
  description: () => `Clear the current song queue`,
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"]
};