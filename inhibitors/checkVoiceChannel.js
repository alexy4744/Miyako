module.exports = (client, msg, cmd) => {
  if (!cmd.options.checkVC) return 1;

  if (!msg.member.voice) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}You must join a voice channel before executing this command!`,
        color: msg.colors.fail
      }
    });
  } else if (msg.guild.player && msg.member.voice.channel && msg.guild.player.channelId && msg.member.voice.channel.id !== msg.guild.player.channelId) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}You must join #${msg.guild.channels.get(msg.guild.player.channelId).name} in order to execute this command!`,
        color: msg.colors.fail
      }
    });
  } else { // eslint-disable-line
    return 1;
  }
};