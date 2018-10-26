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
      cooldown: 5,
      description: () => `Show the currently playing song and it's progress.`,
      aliases: ["np"],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  async run(msg) {
    if (!msg.guild.player || (msg.guild.player && msg.guild.player.queue.length < 1)) return msg.fail(`There is nothing playing!`);

    const currSong = msg.guild.player.queue[0].info;
    const thumbnail = await this.client.player.getThumbnail(currSong);

    const currentTime = msg.guild.player.musicPlayTime();
    const trackLength = msg.guild.player.queue[0].info.length;
    const timeDisplay = `\`${moment.duration(currentTime, "milliseconds").format()}/${moment.duration(trackLength, "milliseconds").format()}\``;
    const timeBar = "━".repeat(50).split("");

    for (let i = 0; i < timeBar.length; i++) {
      // Multiply len by the pattern length to get the right rate to change the dot's positon. Defaults to 1.
      if (i === timeBar.length - 1 || i === Math.round((50 * currentTime) / trackLength)) {
        timeBar.splice(i, 1, "🔵"); // Replace the character at this index with the dot to visualize the player's current position.
        break;
      }
    }

    return msg.channel.send({
      embed: {
        title: `💽${msg.emojis.bar}Now Playing`,
        description: `**Title**: [**${currSong.title}**](${currSong.uri})\n\n\`${timeBar.join("")}\`\n${timeDisplay}`,
        thumbnail: { url: thumbnail },
        color: msg.colors.default
      }
    });
  }
};