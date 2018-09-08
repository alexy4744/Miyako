/* eslint no-undefined: 0 */

module.exports = async (client, msg) => {
  client.messagesPerSecond++;

  if (msg.guild) {
    if (!msg.guild.me.hasPermission("SEND_MESSAGES")) return; // If bot doesn't have the permissions to send messages, dont even check for command.
    else if (!client.cache.has(msg.guild.id)) await msg.guild.updateCache();
  }

  let count = 0;

  for (const monitor in client.monitors) { // eslint-disable-line
    try {
      if (isNaN(count)) break; // If the inhibitor throws anything that is not a number, then the command should fail to execute.
      count += client.monitors[monitor](client, msg); // Inhibitors returns 1 if it doesn't fail or return any error.
    } catch (error) {
      break;
    }
  }

  if (count < Object.keys(client.monitors).length) return;

  if (msg.author.bot) return;

  const prefix = client.cache.has(msg.guild.id) ? client.cache.get(msg.guild.id).prefix ? client.cache.get(msg.guild.id).prefix : client.prefix : client.prefix;

  if (!msg.content.toLowerCase().startsWith(prefix)) return; // eslint-disable-line

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (client.commands[cmd]) return client.runCmd(msg, client.commands[cmd], args);
  else if (client.aliases[cmd]) return client.runCmd(msg, client.commands[client.aliases[cmd]], args);
};