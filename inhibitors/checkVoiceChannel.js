module.exports = (client, msg, cmd) => {
  if (!cmd.options.checkVC) return 1;
  if (!msg.member.voiceChannel) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}You must join a voice channel before executing this command!`,
        color: msg.colors.fail
      }
    });
  } else if (msg.guild.queue && msg.member.voiceChannel.id !== msg.guild.queue.channelId) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}You must join #${msg.guild.channels.get(msg.guild.queue.channelId).name} in order to execute this command!`,
        color: msg.colors.fail
      }
    });
  } else { // eslint-disable-line
    return 1;
  }
};