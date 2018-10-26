const Command = require("../../modules/Base/Command");
const moment = require("moment");
require("moment-duration-format")(moment);

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      checkVC: true,
      checkDJ: true,
      cooldown: 5,
      description: () => `Play a tracks from an available source.`,
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
      this.client.player.join(msg);
      msg.guild.player = {
        queue: [],
        channelId: msg.member.voice.channel.id,
        playing: false,
        paused: false,
        volume: 75
      };
    }

    const tracks = await this.client.player.getSong(args.join(" ")).catch(error => ({ "error": error }));

    if (tracks.error) return msg.error(tracks.error, `play this track!`);
    if (tracks.length < 1) return msg.fail(`No search results have returned!`);
    if (tracks[0].info.loadType === "LOAD_FAILED") return msg.fail(`"${tracks[0].info.title}" has failed to load!`);

    if (tracks[0].info.loadType === "PLAYLIST_LOADED") {
      for (const track of tracks) msg.guild.player.queue.push(track);
    } else {
      msg.guild.player.queue.push(tracks[0]);
    }

    if (!msg.guild.player.playing && !msg.guild.player.paused) this.client.player.play(msg.guild);

    const thumbnail = await this.client.player.getThumbnail(msg.guild.player.queue[0].info);
    const position = msg.guild.player.queue.findIndex(track => track.info.identifier === tracks[0].info.identifier) + 1;

    return msg.channel.send({
      embed: {
        title: `▶${msg.emojis.bar}Track has been added to the queue!`,
        description: `**Title**: [**${tracks[0].info.title}**](${tracks[0].info.uri})\n\n**Duration**: ${moment.duration(tracks[0].info.length, "milliseconds").format()}\n\n**Position**: #${position}`,
        thumbnail: { "url": thumbnail },
        color: msg.colors.default
      }
    });
  }
};