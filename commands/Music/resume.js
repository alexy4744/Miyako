module.exports.run = (client, msg) => {
  if (!client.LePlayer.guilds.has(msg.guild.id)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}I am currently not playing anything!`,
        color: msg.colors.fail
      }
    });
  }

  if (!client.LePlayer.guilds.get(msg.guild.id).paused) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}I am already playing!`,
        color: msg.colors.fail
      }
    });
  }

  client.LePlayer.resume(msg.guild.id).then(() => msg.channel.send({
    embed: {
      title: `⏯${msg.emojis.bar}I have resumed the player!`,
      color: msg.colors.success
    }
  })).catch(e => msg.error(e, "resume the player!"));
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: true,
  cooldown: 5,
  description: () => `Resume the current song if it's paused.`,
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"]
};