/* eslint no-undefined: 0 */

module.exports = async (client, msg) => {
  client.messagesPerSecond++;

  if (msg.guild) {
    if (!msg.guild.me.hasPermission("SEND_MESSAGES")) return;
    if (!client.cache.guilds.has(msg.guild.id)) { // If the cache does not exist in the Map, then cache it
      let guildCache = await client.db.get("guilds", msg.guild.id).catch(e => ({ "error": e }));
      if (guildCache && guildCache.error) return console.error(guildCache.error); // Silently fail if an error occurs

      if (!guildCache) {
        try {
          guildCache = { _id: msg.guild.id };
          await client.db.insert("guilds", guildCache);
        } catch (error) {
          return console.error(error); // Silently fail if an error occurs
        }
      }

      client.cache.guilds.set(msg.guild.id, guildCache);
    }
  }

  let count = 0;

  for (const monitor in client.monitors) { // eslint-disable-line
    try {
      if (isNaN(count)) break; // If the inhibitor throws anything that is not a number, then the command should fail to execute.
      count += await client.monitors[monitor](client, msg); // Inhibitors returns 1 if it doesn't fail or return any error.
    } catch (error) {
      break;
    }
  }

  if (count < Object.keys(client.monitors).length) return;
  if (msg.author.bot) return;

  const prefix = msg.guild ? msg.guild.cache.prefix || client.prefix : client.prefix;

  if (!msg.content.toLowerCase().startsWith(prefix)) return; // eslint-disable-line

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (client.commands[cmd]) return client.runCmd(msg, client.commands[cmd], args);
  else if (client.aliases[cmd]) return client.runCmd(msg, client.commands[client.aliases[cmd]], args);
};