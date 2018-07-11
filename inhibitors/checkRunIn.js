module.exports = (client, msg, cmd) => {
  const runIn = cmd.options.runIn;
  const len = runIn.length;

  if (len < 1) return 1;

  const types = {
    "text": "text channels",
    "dm": "DMs"
  };

  for (let i = 0; i < len; i++) {
    if (msg.channel.type === runIn[i]) return 1; // eslint-disable-line
    else { // eslint-disable-line
      return msg.channel.send({
        embed: {
          title: `${msg.emojis.fail}This command can only be ran in ${types[cmd.options.runIn[i]]}!`,
          color: msg.colors.fail
        }
      });
    }
  }
};