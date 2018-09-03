module.exports = (client, msg) => {
  if (client.cache.get(client.user.id).devMode && msg.author.id !== client.owner) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Sorry ${msg.author.username}, I am currently in developer mode and cannot execute any commands for now!`,
        color: msg.colors.fail
      }
    });
  } else return 1; // eslint-disable-line
};