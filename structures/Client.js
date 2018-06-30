const { Client, Collection } = require("discord.js");
const { readdir } = require("fs-nextra");
const RethinkDB = require("../db/rethinkdb");
const Structures = require("../structures/Structures");

module.exports = class Void extends Client {
  constructor(options = {}) {
    super();
    this.events = new Collection();
    this.inhibitors = new Collection();
    this.commands = new Collection();
    this.aliases = new Collection();
    this.db = new RethinkDB();
    this.userCooldowns = new Set();
    this.structures = Structures;
    this.owner = options.owner;
    this.prefix = options.prefix;

    process.on("unhandledRejection", (reason, p) => {
      console.error(reason, "Unhandled Rejection at Promise", p);
    });

    process.on("uncaughtException", err => {
      console.error(err, "Uncaught Exception thrown");
      process.exit(1);
    });

    /* Load all client events. */
    readdir("./events").then(events => {
      if (events.length < 1) throw new Error("No events found");
      events.map(e => this.events.set(e.slice(0, -3), require(`../events/${e}`)));
    }).catch(error => {
      console.error(error);
    });

    /* Load all commands and aliases. */
    readdir("./commands").then(folders => {
      folders.map(folder => {
        readdir(`./commands/${folder}`).then(commands => {
          commands.map(c => {
            const cmd = require(`../commands/${folder}/${c}`);
            if (!cmd.options) console.error(`${c} must export an object called "options" module.exports.options = {}`); // eslint-disable-line
            else if (!cmd.run) console.error(`${c} must export a function called "run" module.exports.run = () => {}`); // eslint-disable-line
            else {
              this.commands.set(c.slice(0, -3), {
                category: folder,
                command: cmd
              });
              if (cmd.options && (cmd.options.aliases || cmd.options.aliases.length > 0)) { // Check if there are aliases for this command.
                for (let i = 0, len = cmd.options.aliases.length; i < len; i++) {
                  this.aliases.set(cmd.options.aliases[i], this.commands.get(c.slice(0, -3)));
                }
              }
            }
          });
        }).catch(error => {
          console.error(error);
        });
      });
    }).catch(error => {
      console.error(error);
    });

    /* Load all command inhibitors. */
    readdir("./inhibitors").then(inhibitors => {
      inhibitors.map(i => {
        this.inhibitors.set(i.slice(0, -3), require(`../inhibitors/${i}`));
      });
    }).catch(error => {
      console.error(error);
    });
  }

  // Perform a check against all inhibitors before executing the command.
  runCmd(msg, cmd, args) {
    if (!this.userCooldowns.has(msg.author.id)) {
      if (msg.author.id !== this.owner) {
        this.userCooldowns.add(msg.author.id);
        setTimeout(() => this.userCooldowns.delete(msg.author.id), cmd.command.options.cooldown * 1000);
      }
    } else {
      return msg.channel.send(`${msg.author.toString()}, wait ${cmd.command.options.cooldown} seconds before executing commands again!`).then(m => {
        setTimeout(() => m.delete().catch(() => {}), cmd.command.options.cooldown * 1000);
      });
    }

    const keys = Array.from(this.inhibitors.keys());
    const len = keys.length;
    let count = 0; // Keep track of the inhibitors that allows the command to execute.

    if (len < 1 || cmd.command.options.disableCheck) return cmd.command.run(this, msg, args); // Skip inhibitor checking if enabled.

    for (let i = 0; i < len; i++) { // Loop through all loaded inhibitors.
      try {
        if (isNaN(count)) break; // If the inhibitor throws anything that is not a error, then the command should fail to execute.
        count += this.inhibitors.get(keys[i])(this, msg, cmd); // Inhibitors returns 1 if it doesn't fail or return any error.
      } catch (error) {
        break;
      }
    }

    // If all inhibitors return 1 and equals to the total number of inhibitor, run the command.
    if (count >= len) return cmd.command.run(this, msg, args);
  }
};