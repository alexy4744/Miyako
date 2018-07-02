module.exports = (client, msg, cmd) => {
  if (!cmd.command.options.botOwnerOnly || (msg.author.id === client.owner && cmd.command.options.botOwnerOnly)) return 1;
  // Silently fail the command by throwing an empty error
  else throw new Error(); // eslint-disable-line
};