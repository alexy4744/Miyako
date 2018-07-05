const { yt, twitch } = require("../config.json");
const { LePlayer } = require("LePlayer");
const chalk = require("chalk");
const figlet = require("figlet");

module.exports = client => {
  client.updateCache();

  client.LePlayer = new LePlayer(client, { // Initialze LePlayer in the ready event to get the bot's user id.
    port: 6969,
    cleanUpOnClose: true,
    ytAPIkey: yt,
    twitchAPIkey: twitch
  });

  client.LePlayer.on("error", error => console.log(error));

  client.LePlayer.on("finished", guild => {
    if (!guild.looped) guild.queue.shift();
    if (guild.queue.length > 0) client.LePlayer.play(guild.guildId, guild.queue[0].track); // eslint-disable-line
    else {
      client.LePlayer.stop(guild.guildId).then(g => {
        g.queue = [];
        g.updates = {};
        g.playing = false;
        g.paused = false;
      });
    }
  });

  const readyMessage = [
    `✔  ${client.events.size} events ${chalk.green("loaded!")}`,
    `✔  ${client.inhibitors.size} inhibitors ${chalk.green("loaded!")}`,
    `✔  ${client.commands.size} commands ${chalk.green("loaded!")}`,
    `✔  ${client.aliases.size} command aliases ${chalk.green("loaded!")}`,
    `${client.LePlayer ? `🥙  LePlayer has been ${chalk.green("initialized!")}` : ``}`,
    `⏱  All loaded in ${((Date.now() - client.readyAt) / 1000).toFixed(2) > 1 ? chalk.red(((Date.now() - client.readyAt) / 1000).toFixed(2)) : chalk.green(((Date.now() - client.readyAt) / 1000).toFixed(2))} seconds!`,
    `🚀  ${client.user.tag} is ${chalk.green("ready!")} Serving for ${client.guilds.size} guilds and ${client.users.size} users!`
  ];

  figlet.text("Void", {
    font: "Alpha"
  }, (err, art) => {
    if (err) return;
    console.log(chalk.keyword("cyan")(art));
    readyMessage.forEach(msg => {
      console.log(`${chalk.green(`[${new Date(Date.now()).toLocaleString()}]`)} ${chalk.keyword("cyan")(msg)}`);
    });
  });
};
