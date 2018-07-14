const moment = require("moment");
require("moment-duration-format")(moment);

module.exports.run = async (client, msg, args) => {
  if (!msg.member.voiceChannel.speakable) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Sorry ${msg.author.username}, I do not have the permissions to speak in #${msg.member.voiceChannel.name}!`,
        color: msg.colors.fail
      }
    });
  }

  if (!client.LePlayer.guilds.has(msg.guild.id)) {
    await client.LePlayer.join(msg).catch(error => msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to join your voice channel!`,
        description: `\`\`\`js\n${error}\n\`\`\``,
        color: msg.colors.fail
      }
    }));
  }

  const songs = await client.LePlayer.getSong(args.join(" ")).catch(() => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}No results returned!`,
      color: msg.colors.fail
    }
  }));

  const guild = client.LePlayer.guilds.get(msg.guild.id);

  if (songs[0].info.playlist) for (let i = 0; i < songs.length; i++) guild.queue.push(songs[i]);
  else guild.queue.push(songs[0]);

  if (!guild.playing && (Object.keys(guild.updates).length < 1 || guild.queue.length < 2)) {
    client.LePlayer.play(msg.guild.id, guild.queue[0].track).then(async () => {
      if (songs[0].info.playlist) {
        let duration = 0;
        songs.map(s => duration += s.info.length);

        if (songs[0].info.source === "youtube") {
          return msg.channel.send({
            embed: {
              title: `▶${msg.emojis.bar}YouTube playlist has been added to the queue!`,
              description: `
Title: **[${songs[0].info.playlistData.snippet.title}](https://www.youtube.com/playlist?list=${songs[0].info.uri})**\n
Author: **${songs[0].info.playlistData.snippet.channelTitle}**\n
Total Duration: **${moment.duration(duration, "milliseconds").format()}**\n
Total Videos Added: **${songs.length}**`,
              thumbnail: {
                "url": songs[0].info.playlistData.snippet.thumbnails.standard.url
              },
              color: msg.colors.default
            }
          });
        }

        if (songs[0].info.source === "soundcloud") {
          return msg.channel.send({
            embed: {
              title: `▶${msg.emojis.bar}SoundCloud playlist has been added to the queue!`,
              description: `
Title: **[${songs[0].info.title}](${args})**\n
Author: **${songs[0].info.channelTitle}**\n
Total Duration: **${moment.duration(duration, "milliseconds").format()}**\n
Total Videos Added: **${songs.length}**`,
              thumbnail: {
                "url": null
              },
              color: msg.colors.default
            }
          });
        }
      } else if (songs[0].info.isStream) {
//         if (songs[0].info.source === "youtube") {
//           return msg.channel.send({
//             embed: {
//               title: `▶${msg.emojis.bar}YouTube stream has been added to the queue!`,
//               description: `
// Title: **[${songs[0].info.title}](${songs[0].info.uri})**\n
// Streamer: **${songs[0].info.author}**\n
// Currently Streaming: **${songs[0].info.streamData.game}**\n
// Viewers: **${songs[0].info.streamData.viewers.toLocaleString()}**\n
// Live Since: **${moment(songs[0].info.streamData.created_at).format("MMMM DD YYYY HH:MM A")}**`
//             }
//           });
//         }

        if (songs[0].info.source === "twitch") {
          return msg.channel.send({
            embed: {
              title: `▶${msg.emojis.bar}Twitch stream has been added to the queue!`,
              description: `
Title: **[${songs[0].info.title}](${songs[0].info.uri})**\n
Streamer: **${songs[0].info.author}**\n
Currently Streaming: **${songs[0].info.streamData.game}**\n
Viewers: **${songs[0].info.streamData.viewers.toLocaleString()}**\n
Live Since: **${moment(songs[0].info.streamData.created_at).format("MMMM DD YYYY HH:MM A")}**`,
              footer: {
                "text": `${Math.round(songs[0].info.streamData.average_fps)} FPS`
              },
              thumbnail: {
                "url": songs[0].info.streamData.preview.medium
              },
              color: msg.colors.default
            }
          });
        }

        if (songs[0].info.source === "mixer") {
          return msg.channel.send({
            embed: {
              title: `▶${msg.emojis.bar}Mixer stream has been added to the queue!`,
              description: `
Title: **[${songs[0].info.title}](${songs[0].info.uri})**\n
Streamer: **${songs[0].info.author}**\n
Currently Streaming: **${songs[0].info.streamData.type.name}**\n
Viewers: **${songs[0].info.streamData.viewersCurrent}**`,
              thumbnail: {
                "url": songs[0].info.streamData.thumbnail.url
              },
              color: msg.colors.default
            }
          });
        }
      } else {
        const nowPlaying = await client.LePlayer.nowPlaying(msg.guild.id, {
          character: "🔵"
        });

        return msg.channel.send({
          embed: {
            title: `▶${msg.emojis.bar}Track has been added to the queue!`,
            description: `
Title: **[${songs[0].info.title}](${songs[0].info.uri})**\n
Author: **${songs[0].info.author}**\n
\`${nowPlaying.bar}\`
\`0:00 / ${moment.duration(songs[0].info.length, "milliseconds").format()}\``,
            color: msg.colors.default
          }
        });
      }
    }).catch(error => msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to play this track!`,
        description: `\`\`\`js\n${error}\n\`\`\``,
        color: msg.colors.fail
      }
    }));
  } else msg.channel.send({ // eslint-disable-line
    embed: {
      title: `▶${msg.emojis.bar}${songs[0].info.title} has been added to the queue!`,
      color: msg.colors.default
    }
  });
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: true,
  cooldown: 5,
  description: () => `Play a song via the available sources.`,
  usage: () => [`A Chill Mix`, `https://twitch.tv/pokimane`, `https://soundcloud.com/vallisalps/young`],
  aliases: [],
  userPermissions: [],
  botPermissions: ["connect", "speak"],
  runIn: ["text"]
};