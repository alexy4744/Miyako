/* eslint no-undefined: 0 */

const { Client, Collection } = require("discord.js");
const fs = require("fs-nextra");
const Database = require("../db/rethinkdb");
const RethinkDB = require("../db/methods");
const Structures = require("../structures/Structures");
const loaders = require("../loaders/loader");

module.exports = class Void extends Client {
  constructor(options = {}) {
    super();
    this.events = new Collection();
    this.inhibitors = new Collection();
    this.commands = new Collection();
    this.aliases = new Collection();
    this.userCooldowns = new Set();
    this.rethink = new Database();
    this.db = new RethinkDB(this, "voidData", "415313696102023169");
    this.structures = Structures;
    this.owner = options.owner;
    this.prefix = options.prefix;
    this.retryAttempts = 5;

    this.db.get().then(data => {
      if (data === null) {
        this.db.insert({
          id: "415313696102023169"
        }).then(() => {
          this.db.get().then(newData => {
            this.cache = newData;
          }).catch(err => {
            throw new Error(err);
          });
        }).catch(err => {
          throw new Error(err);
        });
      }
    }).catch(err => {
      throw new Error(err);
    });

    // Load all the events, inhibitors, commands and goodies.
    for (const loader in loaders) loaders[loader](this, fs); // eslint-disable-line
  }

  // Perform a check against all inhibitors before executing the command.
  async runCmd(msg, cmd, args) {
    // Update the cache of the guild's database.
    // Check for undefined only because the db can return null.
    // There will always be client and user objects, but not member and guild objects.
    if (this.cache === undefined) await this.updateCache().catch(e => msg.error(e, "execute this command"));
    if (msg.author.cache === undefined) await msg.author.updateCache().catch(e => msg.error(e, "execute this command"));
    if (msg.member && msg.member.cache === undefined) await msg.member.updateCache().catch(e => msg.error(e, "execute this command"));
    if (msg.guild && msg.guild.cache === undefined) await msg.guild.updateCache().catch(e => msg.error(e, "execute this command"));

    const keys = Array.from(this.inhibitors.keys());
    const len = keys.length;

    if (len < 1) return cmd.command.run(this, msg, args); // If there's no inhibitors, just run the command.

    let count = 0; // Keep track of the total inhibitors that allow the command to be passed though.

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

  // Update the client's cache.
  updateCache() {
    return new Promise((resolve, reject) => {
      this.db.get().then(data => {
        resolve(this.cache = data);
      }).catch(e => reject(e));
    });
  }
};