module.exports.run = (client, msg, args) => {
  if (!client.LePlayer.guilds.has(msg.guild.id)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}I am currently not playing anything!`,
        color: msg.colors.fail
      }
    });
  }

  const pos = args.join(" ");

  if (isNaN(pos)) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Sorry ${msg.author.username}, I can only seek tracks with numbers!`,
        color: msg.colors.fail
      }
    });
  }

  const guild = client.LePlayer.guilds.get(msg.guild.id);

  if (!guild.queue[0].info.isSeekable) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}This track cannot be seeked!`,
        color: msg.colors.fail
      }
    });
  }

  if (guild.paused) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}I cannot seek a track while the player is paused!`,
        color: msg.colors.fail
      }
    });
  }

  client.LePlayer.seek(msg.guild.id, pos).then(async () => {
    const nowPlaying = await client.LePlayer.nowPlaying(msg.guild.id, {
      character: "🔵"
    });

    return msg.channel.send({
      embed: {
        title: `⏩${msg.emojis.bar}I have seeked the song to ${nowPlaying.currentTime.readable}!`,
        description: `\`${nowPlaying.bar}\`\n\n\`${nowPlaying.currentTime.readable} / ${nowPlaying.trackLength.readable}\``,
        thumbnail: {
          "url": `https://img.youtube.com/vi/${guild.queue[0].info.identifier}/sddefault.jpg`
        },
        color: msg.colors.success
      }
    });
  }).catch(error => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to seek this song!`,
      description: `\`\`\`js\n${error}\n\`\`\``,
      color: msg.colors.fail
    }
  }));
};

module.exports.options = {
  enabled: true,
  guarded: false, // If the command can be disabled per guild
  description: "Seek/Fast Foward the current track",
  nsfw: false,
  aliases: [],
  botOwnerOnly: false,
  checkVC: true,
  disableCheck: false, // Overrides all other boolean
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"],
  cooldown: 5
};