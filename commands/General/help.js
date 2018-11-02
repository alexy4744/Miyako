const Command = require("../../modules/Base/Command");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: msg => `View a list of commands available to ${msg.author.username}`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  run(msg, args) {
    const help = this.helpBuilder(msg);

    if (args[0]) {
      for (const category in help) {
        const index = help[category].findIndex(c => c.name === args[0] || c.aliases.includes(args[0]));
        if (index > -1) return this.specificCommand(msg, help[category][index]);
      }
    }

    let description = "**Available Commands**\n";

    for (const category in help) {
      description += `\n**${category}**\n`;

      for (const command of help[category]) {
        description += `\`${msg.guild.cache.prefix || this.client.prefix}${command.name}\` - ${command.description}\n`;
      }
    }

    return msg.author.send(description, { split: true });
  }

  specificCommand(msg, command) {
    const message = new MessageEmbed()
      .setTitle(command.name)
      .setDescription(command.description)
      .addField("Usage", command.usage)
      .addField("Aliases", `${command.aliases.map(a => `\`${a}\``).join(", ")}`)
      .addField("Cooldown", `${command.cooldown} seconds`)
      .addField("Usable In", `${command.runIn.join(", ")}`)
      .setColor(msg.colors.default);

    return msg.channel.send(message);
  }

  helpBuilder(msg) {
    const help = {};

    for (let command in this.client.commands) {
      command = this.client.commands[command];

      let shouldSkip = false;

      if (Array.isArray(command.userPermissions)) {
        for (const permission of command.userPermissions) {
          if (!msg.member.permissions.has(permission)) {
            shouldSkip = true;
            break;
          }
        }
      }

      if (shouldSkip) continue;
      if (msg.guild.cache.disabledCommands && msg.guild.cache.disabledCommands.includes(command.name)) continue;
      if (this.client.cache.global.disabledCommands && this.client.cache.global.disabledCommands.includes(command.name)) continue;

      if (!help[command.category]) help[command.category] = [];

      help[command.category].push({
        name: command.name,
        description: typeof command.description === "function" ? command.description(msg) : command.description,
        usage: typeof command.usage === "function" ? command.usage(msg) : command.usage,
        aliases: command.aliases,
        cooldown: command.cooldown,
        runIn: command.runIn && !command.runIn[0] ? ["Guild and DMs"] : command.runIn
      });
    }

    return help;
  }
};