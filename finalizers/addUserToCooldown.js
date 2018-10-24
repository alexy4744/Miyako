module.exports = (client, msg, cmd) => {
  if (msg.author.id === client.owner) return;
  msg.guild.userCooldowns.add(msg.author.id);
  setTimeout(() => msg.guild.userCooldowns.delete(msg.author.id), cmd.options.cooldown ? cmd.options.cooldown * 1000 : 5000);
};