/* eslint no-undefined: 0 */
/* eslint guard-for-in: 0 */

const { Client, Collection } = require("discord.js");
const fs = require("fs-nextra");
const RethinkDB = require("../database/methods");
const Structures = require("../structures/Structures");
const loaders = require("../loaders/loader");

module.exports = class Void extends Client {
  constructor(options = {}) {
    super();
    this.events = new Collection();
    this.inhibitors = new Collection();
    this.commands = new Collection();
    this.aliases = new Collection();
    this.categories = new Set();
    this.userCooldowns = new Set();
    this.db = new RethinkDB(this, "voidData", "415313696102023169");
    this.utils = {};
    this.structures = Structures;
    this.owner = options.owner;
    this.prefix = options.prefix;
    this.retryAttempts = options.dbAttempts || 5;

    for (const loader in loaders) loaders[loader](this, fs); // Load all the events, inhibitors, commands and goodies.
  }

  // Perform a check against all inhibitors before executing the command.
  runCmd(msg, cmd, args) {
    // console.log(cmd)
    /* Update the cache of the guild's database before checking inhibitors.
     * --------------------------------------------------------------------------------------------------------
     * Only caching because it would be superrr slowwww if each inhibitor had to await each method
     * for the database, while this takes less than 0.05 milliseconds for the bot to execute a command.
     * --------------------------------------------------------------------------------------------------------
     * Check for undefined only because null is valid if the record doesn't exist.
     * --------------------------------------------------------------------------------------------------------
     * There will always be client and user objects, but not member and guild objects,
     * since the command could be sent in DMs rather than a guild text channel.
     */

    if (this.cache === undefined) return msg.error("Client cache still does not exist", "execute this command!");
    if (msg.author.cache === undefined) return msg.error("User cache still does not exist", "execute this command!");
    if (msg.member && msg.member.cache === undefined) return msg.error("Member cache still does not exist", "execute this command!");
    if (msg.guild && msg.guild.cache === undefined) return msg.error("Guild cache still does not exist", "execute this command!");

    const inhibitors = Array.from(this.inhibitors.keys());

    if (inhibitors.length < 1) return cmd.run(this, msg, args); // If there's no inhibitors, just run the command.

    let count = 0; // Keep track of the total inhibitors that allow the command to be passed though.

    for (const inhibitor of inhibitors) { // Loop through all loaded inhibitors.
      try {
        if (isNaN(count)) break; // If the inhibitor throws anything that is not a number, then the command should fail to execute.
        count += this.inhibitors.get(inhibitor)(this, msg, cmd); // Inhibitors returns 1 if it doesn't fail or return any error.
      } catch (error) {
        break;
      }
    }

    // If all inhibitors return 1 and equals to the total number of inhibitor, run the command.
    if (count >= inhibitors.length) return cmd.run(this, msg, args);
  }

  /**
   * Update the client's cache.
   * @param {String} key The key to manually update the cache by.
   * @param {String} value The value to set the key manually by.
   * @returns {Promise<Object>} The updated key of the client's cache.
   */
  updateCache(key, value) {
    return new Promise((resolve, reject) => {
      this.db.get().then(data => {
        resolve(this.cache = data);
      }).catch(e => {
        // If what ever reason it fails to get from database, try to manually update the key with the new value of the cache.
        if (key && value) {
          if (!this.cache) this.cache = {};
          else resolve(this.cache[key] = value);
        } else {
          this.db.replace(typeof this.cache === undefined ? {} : this.cache).then(() => reject(e)).catch(err => reject(err)); // Restore the database to match the current cache.
        }
      });
    });
  }
};