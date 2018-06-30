module.exports = (client, msg, cmd) => {
  if (cmd.command.options.enabled) return 1; // eslint-disable-line
  // Silently fail the command by throwing an empty error object
  else throw new Error(); // eslint-disable-line
};