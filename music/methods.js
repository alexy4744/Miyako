const Lavalink = require("../music/Lavalink");
const snekfetch = require("snekfetch");

module.exports = class extends Lavalink {
  constructor(...args) { super(...args); } // eslint-disable-line

  async getSong(query) {
    const res = await snekfetch.get(`http://${this.client.player.host}:${this.client.player.APIport}/loadtracks`)
      .query({ identifier: `ytsearch:${query}` })
      .set("Authorization", "youshallnotpass")
      .catch(error => ({
        "error": error
      }));

    if (res.error) return Promise.reject(res.error);
    if (!res) return Promise.reject(new Error(`I couldn't GET from http://${this.client.player.host}:${this.client.player.APIport}/loadtracks`));

    for (const track of res.body.tracks) {
      track.info.looped = false;
      track.info.thumbnail = `http://i3.ytimg.com/vi/${track.info.identifier}/maxresdefault.jpg`;
      track.info.loadType = res.body.loadType;
      track.info.playlistInfo = res.body.playlistInfo;
    }

    return Promise.resolve(res.body.tracks);
  }

  async updateDatabase(guild, key, value) {
    try {
      await guild.db.update({ [key]: value });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async play(guild, track, target) {
    this.send({
      "op": "play",
      "guildId": guild.id,
      "track": track
    }, target);

    guild.player.playing = true;

    try {
      return await this.updateDatabase(guild, "track", guild.player.queue[0]); // save the current track to the database.
    } catch (error) {
      return console.error(error);
    }
  }

  seek(guild, pos, target) {
    this.send({
      "op": "seek",
      "guildId": guild.id,
      "position": pos
    }, target);
  }

  skip(guild, target) {
    if (guild.player.queue.length >= 1) guild.player.queue.shift();
    if (guild.player.queue.length >= 1) this.play(guild, guild.player.queue[0].track, target);
  }

  resume(guild, target) {
    this.send({
      "op": "pause",
      "guildId": guild.id,
      "pause": false
    }, target);

    guild.player.paused = false;
    return guild.player.playing = true;
  }

  pause(guild, target) {
    this.send({
      "op": "pause",
      "guildId": guild.id,
      "pause": true
    }, target);

    guild.player.paused = true;
    return guild.player.playing = false;
  }

  volume(guild, vol, target) {
    this.send({
      "op": "volume",
      "guildId": guild.id,
      "volume": vol
    }, target);

    return guild.player.volume = parseInt(vol);
  }

  stop(guild, target) {
    this.send({
      "op": "stop",
      "guildId": guild.id
    }, target);

    guild.player.paused = false;
    return guild.player.playing = false;
  }

  async destroy(guild, target) {
    this.send({
      "op": "destroy",
      "guildId": guild.id
    }, target);

    try {
      await this.updateDatabase(guild, "track", null); // save the current track to the database.
      return delete guild.player;
    } catch (error) {
      return console.error(error);
    }
  }

  leave(guild, target) {
    this.send({
      "op": 4,
      "shard": this.client.player.shards,
      "d": {
        "guild_id": guild.id,
        "channel_id": null,
        "self_mute": false,
        "self_deaf": false
      }
    }, target);

    guild.player.channelId = null;
    return guild.player.playing = false;
  }

  join(msg, target) {
    return this.send({
      "op": 4,
      "shard": this.client.player.shards,
      "d": {
        "guild_id": msg.guild.id,
        "channel_id": msg.member.voice.channel.id,
        "self_mute": false,
        "self_deaf": false
      }
    }, target);
  }
};