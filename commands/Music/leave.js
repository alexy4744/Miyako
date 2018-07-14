module.exports.run = (client, msg) => {
  if (!client.LePlayer.guilds.has(msg.guild.id)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}${msg.author.username}, I am currently not connected to any voice channels!`,
        color: msg.colors.fail
      }
    });
  }

  const voiceChannel = msg.guild.channels.get(client.LePlayer.guilds.get(msg.guild.id).channelId);

  client.LePlayer.leave(msg.guild.id).then(() => msg.channel.send({
    embed: {
      title: `${msg.emojis.success}I have sucessfully disconnected from #${voiceChannel.name}`,
      color: msg.colors.success
    }
  })).catch(error => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}I have failed to disconnect from #${voiceChannel.name}`,
      description: `\`\`\`js\n${error}\n\`\`\``,
      color: msg.colors.fail
    }
  }));
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: true,
  cooldown: 5,
  description: () => `Leave the guild's voice channel`,
  aliases: ["disconnect"],
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"]
};