const Command = require("../../modules/Command");
const { MessageEmbed } = require("discord.js");
const os = require("os");
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
      description: msg => `View the current statistics and system information of ${msg.client.user.toString()}`,
      aliases: ["botinfo", "botstats", "miyako"],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async run(msg) {
    const statistics = new MessageEmbed()
      .setTitle(`📈${msg.emojis.bar}Statistics`)
      .setDescription(`
      **Username**: ${this.client.user.toString()} (\`${this.client.user.id}\`)\n
      **Owner**: ${this.client.users.get(this.client.owner).tag} (\`${this.client.owner}\`)\n
      **Created On**: ${moment(this.client.user.createdAt).format("dddd, MMMM Do YYYY, hh:mm:ss A")}\n
      **Uptime**: ${moment.duration(this.client.uptime).format(" D [days], H [hours], m [minutes], s [seconds]")}\n
      **Users**: \`${this.client.users.size.toLocaleString()}\`\n
      **Guilds**: \`${this.client.guilds.size.toLocaleString()}\`\n
      **Channels**: \`${this.client.channels.size.toLocaleString()}\`\n
      **Emojis**: \`${this.client.emojis.size.toLocaleString()}\`\n
      **Commands**: \`${Object.keys(this.client.commands).length.toLocaleString()}\``);

    const system = new MessageEmbed()
      .setTitle(`🖥${msg.emojis.bar}System Information`)
      .setDescription(`
      **CPU Model**: ${os.cpus()[0].model}\n
      **Architecture**: ${os.arch()}\n
      **Memory Usage**: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB\n
      **Free Memory**: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB\n
      **Platform**: ${os.platform()}\n`);

    const links = new MessageEmbed()
      .setTitle(`🔗${msg.emojis.bar}Links`)
      .setDescription(`
      **Invite URL**: **${await this.client.generateInvite().then(link => link.replace("permissions=0", "permissions=8")).catch(() => "Failed to generate an invite link")}**\n
      **GitHub Repository**: **https://github.com/alexy4744/${this.client.user.username}**\n
      **Real Time Statistics**: **https://miyako.xyz/stats**`);

    const allEmbeds = [statistics, system, links];
    const avatar = this.client.user.getAvatar();

    for (const embed of allEmbeds) {
      embed.setThumbnail(avatar);
      embed.setColor(msg.colors.default);
    }

    return msg.paginate(allEmbeds);
  }
};