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
  })).catch(error => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to resume the player!`,
      description: `\`\`\`js\n${error}\n\`\`\``,
      color: msg.colors.fail
    }
  }));
};

module.exports.options = {
  enabled: true,
  guarded: false, // If the command can be disabled per guild
  description: "Resume the currently paused song",
  nsfw: false,
  aliases: [],
  botOwnerOnly: false,
  checkVC: true,
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"],
  cooldown: 5
};