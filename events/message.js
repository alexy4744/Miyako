/* eslint no-undefined: 0 */

module.exports = async (client, msg) => {
  if (client.cache === undefined) await client.updateCache().catch(() => {});
  if (msg.author.cache === undefined) await msg.author.updateCache().catch(() => {});
  if (msg.member && msg.member.cache === undefined) await msg.member.updateCache().catch(() => {});
  if (msg.guild && msg.guild.cache === undefined) await msg.guild.updateCache().catch(() => {});

  const prefix = msg.guild && msg.guild.cache ? msg.guild.cache.prefix : "v$";

  if (!msg.content.toLowerCase().startsWith(prefix)) return; // eslint-disable-line
  if (msg.guild && !msg.guild.me.hasPermission("SEND_MESSAGES")) return; // If bot doesn't have the permissions to send messages, dont even check for command.

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (client.commands.has(cmd) || client.aliases.has(cmd)) {
    console.time("run time");
    return client.runCmd(msg, client.commands.get(cmd) || client.aliases.get(cmd), args);
  }
};