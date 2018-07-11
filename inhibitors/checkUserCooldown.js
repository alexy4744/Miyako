module.exports = (client, msg, cmd) => {
  if (!cmd.options.cooldown || cmd.options.cooldown < 1) return 1;
  if (!client.userCooldowns.has(msg.author.id)) {
    if (msg.author.id !== client.owner) {
      client.userCooldowns.add(msg.author.id);
      setTimeout(() => client.userCooldowns.delete(msg.author.id), cmd.options.cooldown * 1000);
    }

    return 1; // eslint-disable-line
  } else { // eslint-disable-line
    return msg.channel.send(`${msg.author.toString()}, wait ${cmd.options.cooldown} seconds before executing commands again!`).then(m => {
      setTimeout(() => m.delete().catch(() => {}), 10000);
    });
  }
};