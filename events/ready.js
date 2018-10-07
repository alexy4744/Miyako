const chalk = require("chalk");

module.exports = client => {
  const readyMessage = [
    `👍  ${Object.keys(client.events).length.toLocaleString()} events ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.inhibitors).length.toLocaleString()} inhibitors ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.monitors).length.toLocaleString()} monitors ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.commands).length.toLocaleString()} commands ${chalk.green("loaded!")}`,
    `${client.player.ws ? `🎵  Lavalink has been ${chalk.green("initialized!")}` : `❌  Lavalink has ${chalk.red("failed")} to initialize!`}`,
    `⏱  All loaded in ${((Date.now() - client.readyAt) / 1000).toFixed(2) > 1 ? chalk.red(((Date.now() - client.readyAt) / 1000).toFixed(2)) : chalk.green(((Date.now() - client.readyAt) / 1000).toFixed(2))} seconds!`,
    `🚀  ${client.user.tag} is ${chalk.green("ready!")} Serving for ${client.guilds.size.toLocaleString()} guilds and ${client.users.size.toLocaleString()} users!`
  ];

  readyMessage.forEach(msg => console.log(`${chalk.green(`[${new Date(Date.now()).toLocaleString()}]`)} ${chalk.keyword("cyan")(msg)}`));
};
