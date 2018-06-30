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
  })).catch(error => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to pause the player!`,
      description: `\`\`\`js\n${error}\n\`\`\``,
      color: msg.colors.fail
    }
  }));
};

module.exports.options = {
  enabled: true,
  guarded: false, // If the command can be disabled per guild
  description: "Pause the current song",
  nsfw: false,
  aliases: [],
  botOwnerOnly: false,
  checkVC: true,
  disableCheck: false, // Overrides all other boolean
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"],
  cooldown: 5
};