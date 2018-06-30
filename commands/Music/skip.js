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
  })).catch(error => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to skip this song!`,
      description: `\`\`\`js\n${error}\n\`\`\``,
      color: msg.colors.fail
    }
  }));
};

module.exports.options = {
  enabled: true,
  guarded: false, // If the command can be disabled per guild
  description: "Skip the currently playing song",
  nsfw: false,
  aliases: [],
  botOwnerOnly: false,
  checkVC: true,
  disableCheck: false, // Overrides all other settings
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"],
  cooldown: 5
};