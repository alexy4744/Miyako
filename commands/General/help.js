/* eslint guard-for-in: 0 */

module.exports.run = (client, msg) => {
  if (msg.channel.type !== "dm") {
    if (msg.guild && msg.guild.me.hasPermission("ADD_REACTIONS")) msg.react("☑").catch(() => {});
    else msg.channel.send(`Help is on the way, ${msg.author.toString()}...`);
  }

  const help = {};
  const sendHelp = [];

  for (const cmd of client.commands) {
    const options = cmd[1].command.options;
    let skipCMD = false;

    if (msg.channel.type === "text" && (options.runIn.length < 1 || options.runIn.includes("text"))) {
      if (options.userPermissions.length > 0) {
        for (const permission of options.userPermissions) if (!msg.member.hasPermission(permission)) skipCMD = true;
      }

      if (skipCMD) continue;
      if (!msg.channel.nsfw && options.nsfw) continue;
      if (msg.author.id !== client.owner && options.botOwnerOnly) continue;

      if (!help[cmd[1].category]) help[cmd[1].category] = {};
      help[cmd[1].category][cmd[0]] = cmd[1].command.options.description;
    } else if (msg.channel.type === "dm" && (options.runIn.length < 1 || options.runIn[0] === "dm")) { // The only way for a command to be DM only is if the first element of the array is DM
      if (options.nsfw || (msg.author.id !== client.owner && options.botOwnerOnly)) continue;

      if (!help[cmd[1].category]) help[cmd[1].category] = {};
      help[cmd[1].category][cmd[0]] = cmd[1].command.options.description;
    }
  }

  for (const category in help) {
    sendHelp.push(`\n**${category}**`);
    for (const cmd in help[category]) sendHelp.push(`\`${cmd}\` **-** ${help[category][cmd]}\n`);
  }

  return msg.author.send(sendHelp);
};

module.exports.options = {
  enabled: true,
  guarded: true,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: "View all of the available commands for you.",
  aliases: [],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};