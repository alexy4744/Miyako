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
    if (res.body.loadType === "LOAD_FAILED") return Promise.reject(new Error("This track has failed to load!"));
    if (!res) return Promise.reject(new Error(`I couldn't GET from http://${this.client.player.host}:${this.client.player.APIport}/loadtracks`));

    return Promise.resolve(res.body.tracks);
  }

  stop(guild) {
    this.send({
      "op": "stop",
      "guildId": guild.id
    });

    guild.paused = false;
    return guild.playing = false;
  }

  destroy(guild) {
    this.send({
      "op": "destroy",
      "guildId": guild.id
    });

    return delete guild.player;
  }

  leave(msg) {
    this.send({
      "op": 4,
      "shard": this.client.player.shards,
      "d": {
        "guild_id": msg.guild.id,
        "channel_id": null,
        "self_mute": false,
        "self_deaf": false
      }
    });

    return this.destroy(msg.guild);
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