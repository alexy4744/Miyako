const Command = require("../../modules/Command");

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

    const track = await this.client.player.getSong(args.join(" ")).catch(error => ({
      "error": error
    }));

    if (track.error) return msg.error(track.error, `play this track!`);
    if (track.length < 1) return msg.fail(`No search results have returned!`);
    if (track[0].info.loadType === "LOAD_FAILED") return msg.fail(`"${track[0].info.title}" has failed to load!`);

    msg.guild.player.queue.push(track[0]);

    if (!msg.guild.player.playing && msg.guild.player.queue.length < 2) this.client.player.play(msg.guild, track[0].track);

    return msg.channel.send({
      embed: {
        title: `▶${msg.emojis.bar}Track has been added to the queue!`,
        description: `[${track[0].info.title}](${track[0].info.uri})`,
        color: msg.colors.default
      }
    });
  }
};