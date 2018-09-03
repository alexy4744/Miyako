/* eslint no-undefined: 0 */
/* eslint no-use-before-define: 0 */

const chalk = require("chalk");
const { Client } = require("discord.js");
const WebSocket = require("ws");
const RethinkDB = require("../database/methods");
const Lavalink = require("../music/methods");
require("./Structures")();

module.exports = class Miyako extends Client {
  constructor(options = {}) {
    super();
    for (const option in options.clientOptions) Object.assign(this.options, { [option]: options.clientOptions[option] }); // eslint-disable-line

    Object.assign(this, {
      "events": {},
      "inhibitors": {},
      "finalizers": {},
      "commands": {},
      "aliases": {},
      "tasks": {},
      "utils": {}
    });

    Object.assign(this, {
      "cache": new Map(),
      "categories": new Set(),
      "userCooldowns": new Set(),
      "player": new Lavalink(this, { port: 6666 }),
      "db": new RethinkDB("clientData", process.env.BOTID),
      "wss": new WebSocket(process.env.WEBSOCKETSERVER)
    });

    Object.assign(this, {
      "owner": options.owner,
      "prefix": options.prefix
    });

    this.setInterval(() => {
      this.cache.get(process.env.BOTID).messagesPerSecond = 0;
      this.cache.get(process.env.BOTID).commandsPerSecond = 0;
    }, 1100);

    this.db.on("updated", () => this.updateCache());

    this.wss.on("open", this._wssOnOpen.bind(this));
    this.wss.on("error", this._wssOnError.bind(this));
    this.wss.on("message", this._handleRequests.bind(this)); // Bind the event listener to this method so that it can process the request.

    this.player.on("error", err => console.error(err));

    this.player.on("finished", guild => {
      if (guild.player && guild.player.queue[0] && !guild.player.queue[0].info.looped) guild.player.queue.shift();

      if (guild.player) {
        if (guild.player.queue.length > 0) {
          guild.player.musicStart = new Date();
          guild.player.musicPauseAll = null;
          guild.player.musicPause = null;

          this.player.send({
            "op": "play",
            "guildId": guild.id,
            "track": guild.player.queue[0].track
          });
        } else {
          guild.player.musicPause = new Date();
          guild.player.playing = false;

          this.wss.send(JSON.stringify({
            "op": "finished",
            "id": guild.id
          }));
        }
      }
    });

    require("../loaders/loader")(this);
  }

  // Perform a check against all inhibitors before executing the command.
  runCmd(msg, cmd, args) {
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
      if (finalizers.length > 0) for (const finalizer of finalizers) _this.finalizers[finalizer](_this);
    }
  }

  async updateCache() {
    const data = await this.db.get();
    return this.cache.set(process.env.BOTID, data);
  }

  /* Handle request sent by the websocket server */
  _handleRequests(data) {
    const request = JSON.parse(data);
    const guild = request.id ? this.guilds.get(request.id) : request.guildId ? this.guilds.get(request.guildId) : false;

    if (request.event === "connection") return console.log(`${chalk.keyword("green")(`[${new Date(Date.now()).toLocaleString()}]`)} ${chalk.keyword("cyan")(`🔗  Connected ${chalk.green("successfully")} to the main websocket server! (${this.wss.url})`)}`);

    if (request.op && guild) {
      if (request.op === "pause") return this.player.pause(guild);
      else if (request.op === "seek" && request.pos) return this.player.seek(guild, request.pos);
      else if (request.op === "resume") return this.player.resume(guild);
      else if (request.op === "skip") return this.player.skip(guild);
      else if (request.op === "leave") return this.player.leave(guild);
      else if (request.op === "init") return this._wssInit(guild, request);
    }
  }

  _wssOnOpen() {
    this.wss.send(JSON.stringify({
      "op": "identify",
      "identifier": process.env.BOT_IDENTIFIER
    }));
  }

  _wssOnError(error) {
    this.wss = null;
    return console.error(error);
  }

  _wssInit(guild, request) {
    this.wss.send(JSON.stringify({
      ...request, // Merge the request object with this object.
      "op": "initB",
      "queue": guild.player ? guild.player.queue ? guild.player.queue : [] : [],
      "track": guild.player ? guild.player.queue[0] ? guild.player.queue[0].info : false : false,
      "time": guild.player ? guild.player.musicPlayTime() : false
    }));
  }
};