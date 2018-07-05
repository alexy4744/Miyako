module.exports.run = (client, msg) => {
  if (client.LePlayer.guilds.has(msg.guild.id)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Sorry ${msg.author.username}, I am already connected to a voice channel!`,
        description: `Current Voice Channel: **#${msg.guild.channels.get(client.LePlayer.guilds.get(msg.guild.id).channelId).name}**`,
        color: msg.colors.fail
      }
    });
  }

  const memberVoiceChannel = msg.member.voiceChannel;

  if (!memberVoiceChannel) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Please join a voice channel first then invite me to your voice channel again!`,
        color: msg.colors.fail
      }
    });
  }

  if (memberVoiceChannel.full) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Sorry ${msg.author.username}, #${memberVoiceChannel.name} is currently full!`,
        description: `There are currently **${memberVoiceChannel.members.size}** members connected to this voice channel! Please make room in order for me to join this voice channel.`,
        color: msg.colors.fail
      }
    });
  }

  if (!memberVoiceChannel.joinable) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Sorry ${msg.author.username}, I do not have the permissions to join #${memberVoiceChannel.name}!`,
        color: msg.colors.fail
      }
    });
  }

  client.LePlayer.join(msg).then(() => msg.channel.send({
    embed: {
      title: `${msg.emojis.success}I have sucessfully joined #${memberVoiceChannel.name}`,
      color: msg.colors.success
    }
  })).catch(error => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}I have failed to join #${memberVoiceChannel.name}`,
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
  checkVC: false,
  cooldown: 5,
  description: "Join the member's voice channel.",
  aliases: [],
  userPermissions: [],
  botPermissions: ["connect", "speak"],
  runIn: ["text"]
};