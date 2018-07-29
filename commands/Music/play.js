/* eslint no-use-before-define: 0 */
/* eslint no-confusing-arrow: 0 */

const Music = require("../../modules/Music");

module.exports = class Join extends Music {
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

  async run(msg, args) {
    if (args.length < 1) return msg.fail(`You must enter a link or a search query for me to play!`);

    if (!msg.guild.player || !msg.guild.player.channelId) {
      this.join(msg);
      msg.guild.player = {
        queue: [],
        channelId: msg.member.voiceChannel.id,
        playing: false,
        paused: false,
        volume: 75
      };
    }

    const track = await this.getSong(args.join(" ")).catch(error => ({
      "error": error
    }));

    if (track.error) return msg.error(track.error, `play this track!`);
    if (track.length < 1) return msg.fail(`No search results have returned!`);

    msg.guild.player.queue.push(track[0]);

    if (!msg.guild.player.playing && msg.guild.player.queue.length < 2) {
      msg.guild.player.playing = true;
      this.send({
        "op": "play",
        "guildId": msg.guild.id,
        "track": track[0].track
      });
    }

    return msg.channel.send({
      embed: {
        title: `${msg.emojis.default}Track has been added to the queue!`,
        description: `[${track[0].info.title}](${track[0].info.uri})`,
        color: msg.colors.default
      }
    });
  }
};