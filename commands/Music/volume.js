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
  })).catch(e => msg.error(e, "adjust the volume!"));
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: true,
  cooldown: 5,
  description: () => `Adjust the volume of the player from 0 - 200%`,
  usage: () => [`50`, `82`, `158`],
  aliases: ["vol"],
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"]
};