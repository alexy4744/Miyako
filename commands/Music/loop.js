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
      description: () => `Loop any song on the queue except livestreams.`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  run(msg, args) {
    if (!msg.guild.player || (msg.guild.player && msg.guild.player.queue.length < 1)) return msg.fail(`There are no songs to loop!`);

    let chosenTrack = 0;

    if (args[0]) {
      if (isNaN(args[0])) return msg.fail(`You must specify a number to choose which song to loop in the queue!`);
      args = parseInt(args[0]);
      if (args > msg.guild.player.queue.length || args < 1) return msg.fail(`Invalid track chosen!`);
      chosenTrack = args - 1;
    }

    const track = msg.guild.player.queue[chosenTrack].info;

    if (track.looped) {
      track.looped = false;
      return msg.channel.send({
        embed: {
          title: `⤴${msg.emojis.bar}"${track.title}" is now un-looped!`,
          color: msg.colors.default
        }
      });
    }

    track.looped = true;

    return msg.channel.send({
      embed: {
        title: `🔁${msg.emojis.bar}"${track.title}" is now looped!`,
        color: msg.colors.default
      }
    });
  }
};