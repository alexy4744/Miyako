module.exports = (client, msg, cmd) => {
  if (!cmd.command.options.checkVC) return 1;
  if (!msg.member.voiceChannel) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}You must join a voice channel before executing this command!`,
        color: msg.colors.fail
      }
    });
  } else if (client.LePlayer.guilds.has(msg.guild.id) && msg.member.voiceChannel.id !== client.LePlayer.guilds.get(msg.guild.id).channelId) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}You must join #${msg.guild.channels.get(client.LePlayer.guilds.get(msg.guild.id).channelId).name} in order to execute this command!`,
        color: msg.colors.fail
      }
    });
  } else { // eslint-disable-line
    return 1;
  }
};