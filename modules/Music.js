const Command = require("./Command");
const snekfetch = require("snekfetch");

module.exports = class Music extends Command {
  // Methods that might be used in more than one music commmand.
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
      track.info.loadType = res.body.loadType;
      track.info.playlistInfo = res.body.playlistInfo;
    }

    return Promise.resolve(res.body.tracks);
  }

  play(guild, track) {
    this.send({
      "op": "play",
      "guildId": guild.id,
      "track": track
    });

    return guild.player.playing = true;
  }

  resume(guild) {
    this.send({
      "op": "pause",
      "guildId": guild.id,
      "pause": false
    });

    guild.player.paused = false;
    return guild.player.playing = true;
  }

  pause(guild) {
    this.send({
      "op": "pause",
      "guildId": guild.id,
      "pause": true
    });

    guild.player.paused = true;
    return guild.player.playing = false;
  }

  stop(guild) {
    this.send({
      "op": "stop",
      "guildId": guild.id
    });

    guild.player.paused = false;
    return guild.player.playing = false;
  }

  destroy(guild) {
    this.send({
      "op": "destroy",
      "guildId": guild.id
    });

    return delete guild.player;
  }

  leave(guild) {
    this.send({
      "op": 4,
      "shard": this.client.player.shards,
      "d": {
        "guild_id": guild.id,
        "channel_id": null,
        "self_mute": false,
        "self_deaf": false
      }
    });

    guild.player.channelId = null;
    return guild.player.playing = false;
  }

  join(msg) {
    return this.send({
      "op": 4,
      "shard": this.client.player.shards,
      "d": {
        "guild_id": msg.guild.id,
        "channel_id": msg.member.voiceChannel.id,
        "self_mute": false,
        "self_deaf": false
      }
    });
  }

  send(obj) {
    return this.client.player.send(obj);
  }
};