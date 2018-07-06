/* eslint guard-for-in: 0 */

module.exports.run = (client, msg) => {
  if (msg.guild.me.hasPermission("ADD_REACTIONS")) msg.react("☑");
  else msg.channel.send(`Help is on the way ${msg.author.toString()}...`);

  const help = {};
  const sendHelp = [];

  for (const cmd of client.commands) {
    if (!help[cmd[1].category]) help[cmd[1].category] = {};
    help[cmd[1].category][cmd[0]] = cmd[1].command.options.description;
  }

  for (const category in help) {
    sendHelp.push(`\n**${category}**`);
    for (const cmd in help[category]) sendHelp.push(`\`${cmd}\` **-** ${help[category][cmd]}\n`);
  }

  return msg.author.send(sendHelp);
};

module.exports.options = {
  enabled: true,
  guarded: false,
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