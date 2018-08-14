/* eslint no-undefined: 0 */
/* eslint no-use-before-define: 0 */

const { Client } = require("discord.js");
const WebSocket = require("ws");
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
    this.wss = new WebSocket(`ws://localhost:4000`);
    this.miyakoWSS = new WebSocket(`ws://localhost:5000`);
    this.owner = options.owner;
    this.prefix = options.prefix;
    this.options.disabledEvents = options.disabledEvents;
    this.options.disableEveryone = options.disableEveryone;
    this.options.fetchAllMembers = options.fetchAllMembers;

    this.wss.on("error", this._wssOnError.bind(this));
    this.miyakoWSS.on("error", this._wssOnError.bind(this));
    this.player.on("error", err => console.error(err));

    this.miyakoWSS.on("message", this._handleRequests.bind(this)); // Bind the event listener to this method so that it can process the request.
    this.player.on("finished", guild => {
      if (!guild.player.queue[0].info.looped) guild.player.queue.shift();
      if (guild.player.queue.length > 0) {
        this.player.send({
          "op": "play",
          "guildId": guild.id,
          "track": guild.player.queue[0].track
        });
      } else {
        return guild.player.playing = false;
      }
    });

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

    // Declaring a reference for this because cmdRun() cannot access this client class.
    const _this = this; // eslint-disable-line

    try {
      if (this.cache === undefined) await this.updateCache();
      if (msg.author.cache === undefined) await msg.author.updateCache();
      if (msg.member && msg.member.cache === undefined) await msg.member.updateCache();
      if (msg.guild && msg.guild.cache === undefined) await msg.guild.updateCache();
    } catch (error) {
      return msg.error(error, `execute this command!`);
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
      this.db.get().then(data => resolve(this.cache = data)).catch(e => {
        // If what ever reason it fails to get from database, try to manually update the key with the new value for the cache.
        if (key && value) {
          if (!this.cache) this.cache = {};
          return resolve(this.cache[key] = value);
        } else { // eslint-disable-line
          if (this.cache === undefined) reject(e); // eslint-disable-line
          else return this.db.replace(this.cache).then(() => reject(e)).catch(err => reject(err));
        }
      });
    });
  }

  async _handleRequests(data) {
    // Since the database is all updated in the dashboard's backend, all it has to do here is updating the cache for the bot.
    try {
      const request = JSON.parse(data);
      if (request.data.table === "clientData") await this.updateCache(request.data.key, request.data.value);
      if (request.data.table === "guildData") await this.guilds.get(request.data.id).updateCache(request.data.key, request.data.value);
      if (request.data.table === "memberData") await this.guilds.get(request.data.guildId).members.fetch(request.data.memberId).updateCache(request.data.key, request.data.value);
      if (request.data.table === "userData") await this.users.fetch(request.data.id).updateCache(request.data.key, request.data.value);
    } catch (error) {
      return console.error(error);
    }
  }

  _wssOnError() {
    this.wss = null;
    this.miyakoWSS = null;
    return null;
  }
};