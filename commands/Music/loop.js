module.exports.run = (client, msg) => {
  client.LePlayer.loop(msg.guild.id).then(() => msg.channel.send({
    embed: {
      title: `🔂${msg.emojis.bar}Looping has been enabled for this song!`,
      color: msg.colors.default
    }
  })).catch(e => msg.error(e, "loop this song!"));
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: true,
  cooldown: 5,
  description: () => `Loop the current song.`,
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"]
};