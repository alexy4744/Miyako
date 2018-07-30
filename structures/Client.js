/* eslint no-undefined: 0 */
/* eslint no-use-before-define: 0 */

const { Client } = require("discord.js");
const RethinkDB = require("../database/methods");
const Lavalink = require("../music/Lavalink");
require("../structures/Structures")();

module.exports = class Miyako extends Client {
  constructor(options = {}) {
    super();
    this.events = {};
    this.inhibitors = {};
    this.finalizers = {};
    this.commands = {};
    this.aliases = {};
    this.tasks = {};
    this.utils = {};
    this.categories = new Set();
    this.userCooldowns = new Set();
    this.player = new Lavalink(this, options.id);
    this.db = new RethinkDB("clientData", options.id);
    this.owner = options.owner;
    this.prefix = options.prefix;
    this.options.disabledEvents = options.disabledEvents;
    this.options.disableEveryone = options.disableEveryone;
    this.options.fetchAllMembers = options.fetchAllMembers;

    require("../loaders/loader")(this);
  }

  // Perform a check against all inhibitors before executing the command.
  async runCmd(msg, cmd, args) {
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

    // const cmd = new Command(this);
    // Declaring a reference for this because cmdRun() cannot access this client class.
    const _this = this; // eslint-disable-line

    // TO-DO: Simplify this cache checking
    if (this.cache === undefined) {
      const clientCache = await this.updateCache().catch(e => ({
        "error": e
      }));

      if (clientCache.error) return msg.error(clientCache.error, `execute this command!`);
    }

    if (msg.author.cache === undefined) {
      const userCache = await msg.author.updateCache().catch(e => ({
        "error": e
      }));

      if (userCache.error) return msg.error(userCache.error, `execute this command!`);
    }

    if (msg.member && msg.member.cache === undefined) {
      const memberCache = await msg.member.updateCache().catch(e => ({
        "error": e
      }));
      if (memberCache.error) return msg.error(memberCache.error, `execute this command!`);
    }

    if (msg.guild && msg.guild.cache === undefined) {
      const guildCache = await msg.guild.updateCache().catch(e => ({
        "error": e
      }));
      if (guildCache.error) return msg.error(guildCache.error, `execute this command!`);
    }

    const inhibitors = Object.keys(this.inhibitors);

    if (inhibitors.length < 1) return cmdRun(); // If there's no inhibitors, just run the command.

    let count = 0; // Keep track of the total inhibitors that allow the command to be passed though.

    for (const inhibitor of inhibitors) { // Loop through all loaded inhibitors.
      try {
        if (isNaN(count)) break; // If the inhibitor throws anything that is not a number, then the command should fail to execute.
        count += this.inhibitors[inhibitor](this, msg, cmd); // Inhibitors returns 1 if it doesn't fail or return any error.
      } catch (error) {
        break;
      }
    }

    // If all inhibitors return 1 and equals to the total number of inhibitor, run the command.
    if (count >= inhibitors.length) return cmdRun();

    function cmdRun() {
      cmd.run(msg, args);

      const finalizers = Object.keys(_this.finalizers);

      if (finalizers.length < 1) return null;

      for (const finalizer of finalizers) _this.finalizers[finalizer](_this);

      return null;
    }
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
        // If what ever reason it fails to get from database, try to manually update the key with the new value for the cache.
        if (key && value) {
          if (!this.cache) this.cache = {};
          return resolve(this.cache[key] = value);
        } else { // eslint-disable-line
          if (this.cache === undefined) reject(e); // eslint-disable-line
          else this.db.replace(this.cache).then(() => reject(e)).catch(err => reject(err));
        }
      });
    });
  }
};