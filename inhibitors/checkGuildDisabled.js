module.exports = (client, msg, cmd) => {
  if (!msg.guild || !msg.guild.cache || !msg.guild.cache.disabledCommands) return 1;

  if (msg.guild.cache.disabledCommands.includes(cmd.options.name)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Sorry ${msg.author.username}, this command is disabled in this guild!`,
        color: msg.colors.fail
      }
    });
  } else return 1; // eslint-disable-line
};