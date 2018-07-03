const Void = require("./structures/Client");
const { token, owner, prefix, yt, twitch } = require("./config.json");
const { LePlayer } = require("LePlayer");
const chalk = require("chalk");
const figlet = require("figlet");
const client = new Void({
  owner: owner,
  prefix: prefix
});

client.on("ready", () => {
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
    `⏱  All loaded in ${((Date.now() - client.readyAt) / 60).toFixed(2) > 3 ? chalk.red(((Date.now() - client.readyAt) / 60).toFixed(2)) : chalk.green(((Date.now() - client.readyAt) / 60).toFixed(2))} seconds!`,
    `🚀  ${client.user.tag} is ${chalk.green("ready!")} Serving for ${client.guilds.size} guilds and ${client.users.size} users!`
  ];

  figlet.text("Void", {
    font: "Alpha"
  }, (err, art) => {
    if (err) return;
    console.log(chalk.keyword("cyan")(art));
    readyMessage.map(msg => {
      console.log(`${chalk.green(`[${new Date(Date.now()).toLocaleString()}]`)} ${chalk.keyword("cyan")(msg)}`);
    });
  });
});

client.on("error", error => client.events.get("error")(error));
client.on("guildCreate", guild => client.events.get("guildCreate")(guild));
client.on("message", msg => client.events.get("message")(client, msg));

client.login(token);

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

process.on("uncaughtException", err => {
  console.error(err, "Uncaught Exception thrown");
  process.exit(1);
});