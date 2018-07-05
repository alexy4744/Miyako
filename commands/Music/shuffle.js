module.exports.run = (client, msg) => {
  client.LePlayer.shuffle(msg.guild.id).then(() => msg.channel.send({
    embed: {
      title: `🔀${msg.emojis.bar}I have shuffled the queue!`,
      color: msg.colors.default
    }
  })).catch(error => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to shuffle the queue!`,
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
  description: "Shuffle the song queue.",
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"]
};