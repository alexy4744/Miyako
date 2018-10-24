/* eslint curly: 0 */

module.exports = (client, msg, cmd) => {
  if (cmd.options.enabled) {
    if (!client.cache.global || !Array.isArray(client.cache.global.disabledCommands)) return 1; // eslint-disable-line
    else if (!client.cache.global.disabledCommands.includes(cmd.options.name)) return 1; // eslint-disable-line
    else return 0; // eslint-disable-line
  } else return 0;
};