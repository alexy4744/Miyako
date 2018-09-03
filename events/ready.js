const chalk = require("chalk");
const os = require("os-utils");

module.exports = client => {
  const readyMessage = [
    `👍  ${Object.keys(client.events).length.toLocaleString()} events ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.inhibitors).length.toLocaleString()} inhibitors ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.commands).length.toLocaleString()} commands ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.aliases).length.toLocaleString()} command aliases ${chalk.green("loaded!")}`,
    `${client.player.ws ? `🎵  Lavalink has been ${chalk.green("initialized!")}` : `❌  Lavalink has ${chalk.red("failed")} to initialize!`}`,
    `⏱  All loaded in ${((Date.now() - client.readyAt) / 1000).toFixed(2) > 1 ? chalk.red(((Date.now() - client.readyAt) / 1000).toFixed(2)) : chalk.green(((Date.now() - client.readyAt) / 1000).toFixed(2))} seconds!`,
    `🚀  ${client.user.tag} is ${chalk.green("ready!")} Serving for ${client.guilds.size.toLocaleString()} guilds and ${client.users.size.toLocaleString()} users!`
  ];

  readyMessage.forEach(msg => console.log(`${chalk.green(`[${new Date(Date.now()).toLocaleString()}]`)} ${chalk.keyword("cyan")(msg)}`));

  client.setInterval(async () => { // Send new stats to the websocket server every second as long as the client has not been destroyed.
    client.wss.send(JSON.stringify({
      ...await os.allStats(),
      "op": "stats",
      "commands": Object.keys(client.commands).length.toLocaleString(),
      "commandsRan": client.cache.get(client.user.id).commandsRan ? client.cache.get(client.user.id).commandsRan.toLocaleString() : "Still retrieving...",
      "commandsPerSecond": client.cache.get(client.user.id).commandsPerSecond.toLocaleString(),
      "messagesPerSecond": client.cache.get(client.user.id).messagesPerSecond.toLocaleString(),
      "memoryUsed": process.memoryUsage().heapUsed / 1024 / 1024,
      "guilds": client.guilds.size.toLocaleString(),
      "channels": client.channels.size.toLocaleString(),
      "users": client.users.size.toLocaleString(),
      "uptime": client.uptime
    }));
  }, 1000);
};
