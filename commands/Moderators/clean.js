module.exports.run = (client, msg) => {
  if (!msg.guild.myMessages || msg.guild.myMessages.length < 1) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}There are no messages to delete!`,
        color: msg.colors.fail
      }
    });
  }

  const myMessages = msg.guild.myMessages.get(msg.channel.id);
  const initalSize = myMessages.length;
  let counter = 0;

  myMessages.forEach(async message => {
    counter++;
    const fetchedMessage = await msg.channel.messages.fetch(message).catch(() => null);

    if (fetchedMessage === null) return; // eslint-disable-line
    else { // eslint-disable-line
      const isDeleted = await fetchedMessage.delete().catch(() => null);

      if (isDeleted === null) return; // eslint-disable-line
      else msg.guild.myMessages.set(msg.channel.id, myMessages.splice(counter, 1)); // eslint-disable-line
    }
  });

  if (counter >= myMessages.length) {
    msg.channel.send({
      embed: {
        title: `${msg.emojis.success}I have sucessfully deleted ${initalSize - msg.guild.myMessages.get(msg.channel.id).length} messages!`,
        color: msg.colors.success
      }
    });
  }
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 30,
  description: "Delete the last x amount of messages (maximum: 100) sent by Void in this channel.",
  usage: prefix => `${prefix}clean`,
  aliases: [],
  userPermissions: ["manage_messages"],
  botPermissions: [],
  runIn: []
};