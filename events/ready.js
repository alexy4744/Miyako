const Event = require("../modules/Base/Event");
const chalk = require("chalk");

module.exports = class Ready extends Event {
  constructor(...args) {
    super(...args);
  }

  run() {
    [
      `👍  ${Object.keys(this.client.events).length.toLocaleString()} events ${chalk.green("loaded!")}`,
      `👍  ${Object.keys(this.client.inhibitors).length.toLocaleString()} inhibitors ${chalk.green("loaded!")}`,
      `👍  ${Object.keys(this.client.monitors).length.toLocaleString()} monitors ${chalk.green("loaded!")}`,
      `👍  ${Object.keys(this.client.commands).length.toLocaleString()} commands ${chalk.green("loaded!")}`,
      `${this.client.player.ws ? `🎵  Lavalink has been ${chalk.green("initialized!")}` : `❌  Lavalink has ${chalk.red("failed")} to initialize!`}`,
      `⏱  All loaded in ${((Date.now() - this.client.readyAt) / 1000).toFixed(2) > 1 ? chalk.red(((Date.now() - this.client.readyAt) / 1000).toFixed(2)) : chalk.green(((Date.now() - this.client.readyAt) / 1000).toFixed(2))} seconds!`,
      `🚀  ${this.client.user.tag} is ${chalk.green("ready!")} Serving for ${this.client.guilds.size.toLocaleString()} guilds and ${this.client.users.size.toLocaleString()} users!`
    ]
    .forEach(msg => console.log(`${chalk.green(`[${new Date(Date.now()).toLocaleString()}]`)} ${chalk.keyword("cyan")(msg)}`));
  }
};
