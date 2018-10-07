const Command = require("../../modules/Command");
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      checkVC: true,
      cooldown: 5,
      description: () => `Play a track from an available source.`,
      usage: () => [`Illenium Afterlife`, `Echos Fiction`],
      aliases: [],
      userPermissions: [],
      botPermissions: ["CONNECT", "SPEAK"],
      runIn: ["text"]
    });
  }

  async run(msg) {
    if (!msg.guild.player || !msg.guild.player.channelId) {
      this.client.player.join(msg);
      msg.guild.player = {
        queue: [],
        channelId: msg.member.voice.channel.id,
        playing: false,
        paused: false,
        volume: 75
      };
    }

    const track = await this.client.player.getSong(`CURB UR ENTHUSIAM THEME SONG`).catch(error => ({ "error": error }));

    if (track.error) return msg.error(track.error, `play this track!`);
    if (track.length < 1) return msg.fail(`No search results have returned!`);
    if (track[0].info.loadType === "LOAD_FAILED") return msg.fail(`"${track[0].info.title}" has failed to load!`);

    track[0].info.thumbnail = await this.client.player.getThumbnail(track[0].info.source, track[0].info);

    msg.guild.player.queue.push(track[0]);

    this.client.player.send({
      "op": "new song",
      "guildId": msg.guild.id
    });

    if (!msg.guild.player.playing && msg.guild.player.queue.length < 2) this.client.player.play(msg.guild, track[0].track);

    return msg.channel.send(`***DUN DUN DUN DUN DUN DA DUN DUN DUN DUN DUN***`);
  }
};