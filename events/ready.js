const chalk = require("chalk");
const figlet = require("figlet");

module.exports = client => {
  client.player.on("finished", guild => {
    if (!guild.player.queue[0].info.looped) guild.player.queue.shift();

    if (guild.player.queue.length > 0) {
      client.player.send({
        "op": "play",
        "guildId": guild.id,
        "track": guild.player.queue[0].track
      });
    } else {
      return guild.player.playing = false;
    }
  });

  client.player.once("error", err => console.error(err));

  const readyMessage = [
    `👍  ${Object.keys(client.events).length.toLocaleString()} events ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.inhibitors).length.toLocaleString()} inhibitors ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.commands).length.toLocaleString()} commands ${chalk.green("loaded!")}`,
    `👍  ${Object.keys(client.aliases).length.toLocaleString()} command aliases ${chalk.green("loaded!")}`,
    `${client.player ? `🎵  Lavalink player has been ${chalk.green("initialized!")}` : `❌  Lavalink player has ${chalk.red("failed!")} to initialized`}`,
    `⏱  All loaded in ${((Date.now() - client.readyAt) / 1000).toFixed(2) > 1 ? chalk.red(((Date.now() - client.readyAt) / 1000).toFixed(2)) : chalk.green(((Date.now() - client.readyAt) / 1000).toFixed(2))} seconds!`,
    `🚀  ${client.user.tag} is ${chalk.green("ready!")} Serving for ${client.guilds.size.toLocaleString()} guilds and ${client.users.size.toLocaleString()} users!`
  ];

  return figlet.text(client.user.username, {
    font: "Alpha"
  }, (err, art) => {
    if (err) return;
    console.log(chalk.keyword("cyan")(art));
    readyMessage.forEach(msg => console.log(`${chalk.green(`[${new Date(Date.now()).toLocaleString()}]`)} ${chalk.keyword("cyan")(msg)}`));
  });
};
