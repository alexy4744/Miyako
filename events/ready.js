const chalk = require("chalk");

module.exports = client => {
  const readyMessage = [
    `${client.wss ? `🔗  Connected ${chalk.green("successfully")} to the main websocket server! (127.0.0.1:4000)` : `❌  ${chalk.red("Failed")} to connect to the main websocket server! (127.0.0.1:4000)`}`,
    `${client.wss ? `🔗  Connected ${chalk.green("successfully")} to ${client.user.username}'s websocket server! (127.0.0.1:5000)` : `❌  ${chalk.red("Failed")} to connect to ${client.user.username}'s websocket server! (127.0.0.1:5000)`}`,
    `👍  ${Object.keys(client.events).length.toLocaleString()} events ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.inhibitors).length.toLocaleString()} inhibitors ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.commands).length.toLocaleString()} commands ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.aliases).length.toLocaleString()} command aliases ${chalk.green("loaded!")}`,
    `${client.player.ws ? `🎵  Lavalink has been ${chalk.green("initialized!")}` : `❌  Lavalink has ${chalk.red("failed")} to initialize!`}`,
    `⏱  All loaded in ${((Date.now() - client.readyAt) / 1000).toFixed(2) > 1 ? chalk.red(((Date.now() - client.readyAt) / 1000).toFixed(2)) : chalk.green(((Date.now() - client.readyAt) / 1000).toFixed(2))} seconds!`,
    `🚀  ${client.user.tag} is ${chalk.green("ready!")} Serving for ${client.guilds.size.toLocaleString()} guilds and ${client.users.size.toLocaleString()} users!`
  ];

  return readyMessage.forEach(msg => console.log(`${chalk.green(`[${new Date(Date.now()).toLocaleString()}]`)} ${chalk.keyword("cyan")(msg)}`));
};
