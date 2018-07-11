module.exports = (client, msg, cmd) => {
  if (cmd.options.enabled) return 1; // eslint-disable-line
  // Silently fail the command by throwing an empty error
  else throw new Error(); // eslint-disable-line
};