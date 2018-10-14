const EventEmitter = require("events");
const WebSocket = require("ws");

module.exports = class Lavalink extends EventEmitter {
  constructor(client, options = {}) {
    super();
    this.client = client;
    this.shards = options.shard || 1;
    this.host = options.host || "localhost";
    this.port = process.env.LAVALINK || options.port || 80;
    this.APIport = options.APIport || 2333;

    this.ws = new WebSocket(`ws://${this.host}:${this.port}`, {
      headers: {
        "User-Id": process.env.CLIENT_ID,
        "Num-Shards": this.shards,
        "Authorization": options.password || "youshallnotpass"
      }
    });
    this.ws.on("message", this._message.bind(this));
    this.ws.on("error", this._error.bind(this));
    this.ws.on("close", () => this.ws = null);

    this.client.on("raw", packet => {
      if (packet.t === "VOICE_SERVER_UPDATE") this._sendVoiceUpdate(packet.d); // Intercept these packets and send them to Lavalink instead.
    });
  }

  send(obj, target) {
    if (!this.ws) return this._error(new Error(`No Lavalink player found!`));
    if (!isNaN(obj.op)) {
      this.client.ws.send(obj); // If it is a number, then send it to client ws.
    } else {
      this.ws.send(JSON.stringify(obj), err => { // Send it to Lavalink.
        if (err) return console.error(err);
      });
    }

    if (target && target === "lavalink") return; // eslint-disable-line
    else { // eslint-disable-line
      if (!this.client.wss) return;
      if (!obj.id && (obj.guildId || obj.guild_id)) obj.id = obj.guildId || obj.guild_id;
      obj.queue = this.client.guilds.has(obj.id) ? this.client.guilds.get(obj.id).player ? this.client.guilds.get(obj.id).player.queue : [] : [];

      return this.client.wss.send(JSON.stringify(obj));
    }
  }

  _message(msg) {
    const data = JSON.parse(msg);

    if (data.op === "stats") return this.stats = data;

    if (!this.client.guilds.has(data.guildId)) return;

    const guild = this.client.guilds.get(data.guildId);

    if (data.reason === "REPLACED") return;
    if (data.reason === "FINISHED") return this.emit("finished", guild);

    // If anything bad happens to the current track, emitting the "finished" event will cause the bot to skip the song.
    if (data.reason === "LOAD_FAILED") return this.emit("finished", guild);
    if (data.type === "TrackStuckEvent" || data.type === "TrackExceptionEvent") return this.emit("finished", guild);
  }

  _error(err) {
    return this.emit(err);
  }

  _sendVoiceUpdate(packet) {
    if (!this.client.guilds.has(packet.guild_id)) return console.error("Couldn't find this guild while intercepting packets.");
    const guild = this.client.guilds.get(packet.guild_id);

    return this.send({
      "op": "voiceUpdate",
      "guildId": packet.guild_id,
      "sessionId": guild.me.voice.sessionID,
      "event": packet
    });
  }
};