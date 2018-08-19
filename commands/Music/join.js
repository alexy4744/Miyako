const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Join your voice channel.`,
      aliases: [],
      userPermissions: [],
      botPermissions: ["CONNECT", "SPEAK"],
      runIn: ["text"]
    });
  }

  run(msg) {
    if (!msg.member.voice) return msg.fail(`You must join a voice channel first before executing this command!`);

    const voiceChannel = msg.member.voice.channel;

    if (msg.guild.player && voiceChannel.id === msg.guild.player.channelId) return msg.fail(`I am already in your voice channel!`);
    if (voiceChannel.full) return msg.fail(`#${voiceChannel.name} is currently full!`);
    if (!voiceChannel.joinable) return msg.fail(`I do not have the permissions to join #${voiceChannel.name}!`);

    this.client.player.join(msg);

    if (!msg.guild.player) {
      msg.guild.player = {
        queue: [],
        channelId: voiceChannel.id,
        sessionId: msg.guild.me.voice.sessionId,
        playing: false,
        paused: false,
        volume: 75
      };
      return msg.success(`I have successfully joined #${voiceChannel.name}!`);
    } else if (msg.guild.player.queue.length > 0) { // If the bot is commanded to leave the voice channel while its playing previously, unpause the track and start playing wherever it left off as.
      msg.guild.player.channelId = voiceChannel.id;
      this.client.player.resume(msg.guild);
      return msg.success(`I have successfully joined #${voiceChannel.name}`, `Continuing the playback of **[${msg.guild.player.queue[0].info.title}](${msg.guild.player.queue[0].info.uri})**`);
    }
  }
};