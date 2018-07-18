/* eslint no-undefined: 0 */

module.exports = async (client, msg) => {
  if (msg.guild && msg.guild.cache === undefined) await msg.guild.updateCache().then(() => null).catch(() => { });

  const prefix = msg.guild ? msg.guild.cache ? msg.guild.cache.prefix ? msg.guild.cache.prefix : client.prefix : client.prefix : client.prefix;

  if (!msg.content.toLowerCase().startsWith(prefix)) return; // eslint-disable-line
  if (msg.guild && !msg.guild.me.hasPermission("SEND_MESSAGES")) return; // If bot doesn't have the permissions to send messages, dont even check for command.

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (client.commands.has(cmd) || client.aliases.has(cmd)) client.runCmd(msg, client.commands.get(cmd) || client.aliases.get(cmd), args);
};