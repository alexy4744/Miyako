module.exports = (client, msg) => {
  if (!msg.content.toLowerCase().startsWith(client.prefix)) return; // eslint-disable-line

  const args = msg.content.slice(client.prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (client.commands.has(cmd) || client.aliases.has(cmd)) {
    console.time("run time");
    return client.runCmd(msg, client.commands.get(cmd) || client.aliases.get(cmd), args);
  }
};