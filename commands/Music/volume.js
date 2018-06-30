module.exports.run = (client, msg, args) => {
  if (!args[0]) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}You must enter the volume to adjust the player to!`,
        color: msg.colors.fail
      }
    });
  }

 const vol = args[0];

 client.LePlayer.volume(msg.guild.id, vol).then(v => msg.channel.send({
    embed: {
      title: `${vol < 1 ? "🔇" : vol < 50 ? "🔉" : "🔊"}${msg.emojis.bar}I have succesfully set the volume to ${v}%!`,
      color: msg.colors.success
    }
  })).catch(error => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to adjust the volume!`,
      description: `\`\`\`js\n${error}\n\`\`\``,
      color: msg.colors.fail
    }
  }));
};

module.exports.options = {
  enabled: true,
  guarded: false, // If the command can be disabled per guild
  description: "Adjust the volume of the player",
  nsfw: false,
  aliases: ["vol"],
  botOwnerOnly: false,
  checkVC: true,
  disableCheck: false, // Overrides all other settings
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"],
  cooldown: 5
};