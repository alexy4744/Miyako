module.exports.run = (client, msg, args) => {
  if (!args[0]) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}You must enter the volume to adjust the player to!`,
        color: msg.colors.fail
      }
    });
  }

 client.LePlayer.volume(msg.guild.id, args[0]).then(v => msg.channel.send({
    embed: {
      title: `${v < 1 ? "🔇" : v < 50 ? "🔉" : "🔊"}${msg.emojis.bar}I have succesfully set the volume to ${v}%!`,
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
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: true,
  cooldown: 5,
  description: "Adjust the volume of the player from 0 - 200%.",
  aliases: ["vol"],
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"]
};