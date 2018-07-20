/* eslint guard-for-in: 0 */

module.exports.run = (client, msg, args) => {
  if (args[0]) {
    const cmd = client.commands.get(args[0]).options || client.aliases.get(args[0]).options;
    msg.channel.send({
      embed: {
        title: args[0],
        description: `${cmd.description(msg)}\n\u200B`,
        fields: [
          {
            "name": "Usage",
            "value": `${client.utils.is.function(cmd.usage) ? client.utils.is.array(cmd.usage(msg)) ? cmd.usage(msg).map(u => `${msg.prefix + args[0]} ${u}`).join("\n") : `${msg.prefix + args[0]} ${cmd.usage(msg)}` : msg.prefix + args[0]}`
          }
        ],
        color: msg.colors.default
      }
    });
  } else {
    const help = {};
    const sendHelp = [];

    for (const cmd of client.commands) {
      const options = cmd[1].options;
      let skipCMD = false;

      if (msg.channel.type === "text" && (options.runIn.length < 1 || options.runIn.includes("text"))) {
        if (options.userPermissions.length > 0) {
          for (const permission of options.userPermissions) if (!msg.member.hasPermission(permission)) skipCMD = true;
        }

        if (skipCMD) continue;
        if (!msg.channel.nsfw && options.nsfw) continue;
        if (msg.author.id !== client.owner && options.botOwnerOnly) continue;

        if (!help[cmd[1].options.category]) help[cmd[1].options.category] = {};
        help[cmd[1].options.category][cmd[0]] = cmd[1].options.description(msg);
      } else if (msg.channel.type === "dm" && (options.runIn.length < 1 || options.runIn[0] === "dm")) { // The only way for a command to be DM only is if the first element of the array is DM
        if (options.nsfw || (msg.author.id !== client.owner && options.botOwnerOnly)) continue;

        if (!help[cmd[1].options.category]) help[cmd[1].options.category] = {};
        help[cmd[1].options.category][cmd[0]] = cmd[1].options.description;
      }
    }

    for (const category in help) {
      sendHelp.push(`\n**${category}**`);
      for (const cmd in help[category]) sendHelp.push(`\`${cmd}\` **-** ${help[category][cmd]}\n`);
    }

    msg.author.send(sendHelp).then(() => {
      if (msg.guild && msg.guild.me.hasPermission("ADD_REACTIONS")) msg.react("☑").catch(() => msg.channel.send(`Help is on the way, ${msg.author.toString()}...`));
      else msg.channel.send(`Help is on the way, ${msg.author.toString()}...`);
    }).catch(() => {
      msg.channel.send(`${msg.author.toString()}, I could not DM you. Please check that your DMs are not disabled!`);
    });
  }
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: msg => `View a list of commands available to ${msg.author.toString()}`,
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};