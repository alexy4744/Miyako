module.exports = (client, msg, cmd) => {
  if (!cmd.options.botOwnerOnly || (msg.author.id === client.owner && cmd.options.botOwnerOnly)) return 1;
  else return 0; // eslint-disable-line
};