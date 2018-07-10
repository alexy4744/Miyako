module.exports.run = async (client, msg, args) => {
  const bannedUsers = await msg.guild.fetchBans().catch(e => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to fetch the ban log!`,
      description: `\`\`\`js\n${e}\n\`\`\``,
      color: msg.colors.fail
    }
  }));

  if (!isNaN(args[0]) && args[0].length === 18) { // If it is a user snowflake
    if (bannedUsers.has(args[0])) {
      const guyToUnban = bannedUsers.get(args[0]);
      msg.guild.members.unban(guyToUnban.user).then(guy => msg.channel.send({
        embed: {
          title: `${msg.emojis.success}${guy.tag}(${guy.id}) has been unbanned by ${msg.author.tag}!`, // eslint-disable-line
          color: msg.colors.success
        }
      })).catch(e => msg.channel.send({
        embed: {
          title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to unban ${guyToUnban.user.username + "#" + guyToUnban.user.discriminator}!`, // eslint-disable-line
          description: `\`\`\`js\n${e}\n\`\`\``,
          color: msg.colors.fail
        }
      }));
    } else {
      msg.channel.send({
        embed: {
          title: `${msg.emojis.fail}I cannot find any banned members with the user ID **${args[0]}**!`,
          color: msg.colors.fail
        }
      });
    }
  } else {

  }
  console.log(bannedUsers)
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: "Ban a member, with optional reasoning and number of days of messages to delete.",
  usage: (prefix, client) => `${prefix}ban ${client.user.username}`,
  aliases: [],
  userPermissions: ["administrator"],
  botPermissions: ["ban_members"],
  runIn: ["text"]
};