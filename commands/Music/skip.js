module.exports.run = (client, msg) => {
  if (!client.LePlayer.guilds.has(msg.guild.id) || client.LePlayer.guilds.get(msg.guild.id).queue.length < 1) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}There is currently nothing for me to skip in the queue!`,
        color: msg.colors.fail
      }
    });
  }

  const beforeSkip = client.LePlayer.guilds.get(msg.guild.id).queue[0];

  client.LePlayer.skip(msg.guild.id).then(() => msg.channel.send({
    embed: {
      title: `${msg.emojis.success}I have skipped ${beforeSkip.info.title}`,
      color: msg.colors.success
    }
  })).catch(e => msg.error(e, "skip this song!"));
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: true,
  cooldown: 5,
  description: () => `Skip the currently playing song.`,
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"]
};