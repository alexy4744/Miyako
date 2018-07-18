module.exports.run = (client, msg) => {
  if (!client.LePlayer.guilds.has(msg.guild.id)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}I am currently not playing anything!`,
        color: msg.colors.fail
      }
    });
  }

  if (client.LePlayer.guilds.get(msg.guild.id).paused) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}I am already paused!`,
        color: msg.colors.fail
      }
    });
  }

  client.LePlayer.pause(msg.guild.id).then(() => msg.channel.send({
    embed: {
      title: `⏸${msg.emojis.bar}I have paused the player!`,
      color: msg.colors.success
    }
  })).catch(e => msg.error(e, "pause the player!"));
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: true,
  cooldown: 5,
  description: () => `Pause the current song.`,
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"]
};