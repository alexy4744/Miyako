const Command = require("./Command");
const snekfetch = require("snekfetch");

module.exports = class Music extends Command {
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

    return Object.assign(msg.guild.player, {
      channelId: null,
      queue: []
    });
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