module.exports.run = (client, msg) => {
  client.LePlayer.shuffle(msg.guild.id).then(() => msg.channel.send({
    embed: {
      title: `🔀${msg.emojis.bar}I have shuffled the queue!`,
      color: msg.colors.default
    }
  })).catch(e => msg.error(e, "shuffle the queue!"));
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: true,
  cooldown: 5,
  description: () => `Shuffle the song queue.`,
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"]
};