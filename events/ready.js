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
    `👍  ${client.events.size} events ${chalk.green("loaded!")}`,
    `👍  ${client.inhibitors.size} inhibitors ${chalk.green("loaded!")}`,
    `👍  ${client.commands.size} commands ${chalk.green("loaded!")}`,
    `👍  ${client.aliases.size} command aliases ${chalk.green("loaded!")}`,
    `${client.player ? `🎵  Lavalink player has been ${chalk.green("initialized!")}` : `❌  Lavalink player has ${chalk.red("failed!")} to initialized`}`,
    `⏱  All loaded in ${((Date.now() - client.readyAt) / 1000).toFixed(2) > 1 ? chalk.red(((Date.now() - client.readyAt) / 1000).toFixed(2)) : chalk.green(((Date.now() - client.readyAt) / 1000).toFixed(2))} seconds!`,
    `🚀  ${client.user.tag} is ${chalk.green("ready!")} Serving for ${client.guilds.size} guilds and ${client.users.size} users!`
  ];

  return figlet.text(client.user.username, {
    font: "Alpha"
  }, (err, art) => {
    if (err) return;
    console.log(chalk.keyword("cyan")(art));
    readyMessage.forEach(msg => console.log(`${chalk.green(`[${new Date(Date.now()).toLocaleString()}]`)} ${chalk.keyword("cyan")(msg)}`));
  });
};
