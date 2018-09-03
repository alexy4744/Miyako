/* eslint no-undefined: 0 */

module.exports = (client, msg) => {
  client.cache.get(client.user.id).messagesPerSecond++;

  if (msg.author.bot) return;
  if (msg.guild && !msg.guild.me.hasPermission("SEND_MESSAGES")) return; // If bot doesn't have the permissions to send messages, dont even check for command.

  const prefix = client.cache.has(msg.guild.id) ? client.cache.get(msg.guild.id).prefix ? client.cache.get(msg.guild.id).prefix : "m$" : "m$";

  if (!msg.content.toLowerCase().startsWith(prefix)) return; // eslint-disable-line

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (client.commands[cmd]) return client.runCmd(msg, client.commands[cmd], args);
  else if (client.aliases[cmd]) return client.runCmd(msg, client.commands[client.aliases[cmd]], args);
};