module.exports.run = async (client, msg, args) => {
  const members = msg.mentions.members;
  const prefix = msg.guild.cache ? msg.guild.cache.prefix : "v$";

  if (members.size < 1) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}${msg.author.username}, you must mention the member(s) to be banned!`,
        description: `
**Possible Usages**
${prefix}ban ${client.user.toString()} 7 lol this bot sucks
${prefix}ban ${msg.author.toString()} 3 xD
  
The order where you mention the user does not matter, but the reason must always come after the days of messages to delete.`,
        color: msg.colors.fail
      }
    });
  }

  if (members.size > 10) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}${msg.author.username}, you can only ban 10 members at a time!`,
        color: msg.colors.fail
      }
    });
  }

  if (members.size === 1 && members.first().user === msg.author) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}You cannot ban yourself!`,
        color: msg.colors.fail
      }
    });
  }

  if (members.size === 1 && members.first().user === client.user) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}I cannot ban myself!`,
        color: msg.colors.fail
      }
    });
  }

  members.forEach(member => {
    args = args.filter(arg => arg !== member.toString() && arg !== client.user.toString() && arg !== msg.member.toString()); // Remove mentions from array
  });

  const daysOfMessages = !isNaN(args[0]) ? args[0] : null;
  const reason = daysOfMessages ? args.join(" ").slice(daysOfMessages.length + 1) : args.length > 0 ? args.join(" ") : `Not Specified${msg.emojis.bar}Banned by ${msg.author.tag}`;

  if (members.size === 1) {
    if (members.first().bannable) {
      members.first().ban({
        days: daysOfMessages ? parseInt(daysOfMessages) : 0,
        reason: reason
      }).then(() => msg.channel.send({
        embed: {
          title: `${msg.emojis.success}I have sucessfully banned ${members.first().user.tag}!`,
          description: `**Reason**: ${reason}\n\n${daysOfMessages ? `**Days of messages to delete**: ${daysOfMessages}` : ``}`,
          color: msg.colors.success
        }
      })).catch(e => msg.channel.send({ // eslint-disable-line
        embed: {
          title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to ban ${members.first().user.tag}`,
          description: `\`\`\`js\n${e}\n\`\`\``,
          color: msg.colors.fail
        }
      }));
    } else {
      msg.channel.send({
        embed: {
          title: `${msg.emojis.fail}I have failed to ban ${members.first().user.tag}!`,
          description: `Please make sure that this member does not have a higher privilege than me, such as higher roles, permissions and etc.`,
          color: msg.colors.fail
        }
      });
    }
  } else if (members.size > 1) {
    const membersBanned = [];
    const membersFailed = {}; // Object because I might need the errors later on.

    const message = await msg.channel.send({
      embed: {
        title: `${msg.emojis.pending}Attempting to ban ${members.size} member(s)...`,
        color: msg.colors.pending
      }
    }).catch(() => {});

    for (const member of members) {
      if (member[1].bannable) {
        await member[1].ban({
          days: daysOfMessages ? parseInt(daysOfMessages) : 0,
          reason: reason
        }).then(() => membersBanned.push(member[1])).catch(e => membersFailed[member[1].toString()] = e.message);
      } else membersFailed[member[1]] = "Not Bannable"; // eslint-disable-line

      if (membersBanned.length + Object.keys(membersFailed).length >= members.size) {
        if (message) await message.delete().catch(() => {});
        if (membersBanned.length > 0) {
          msg.channel.send({
            embed: {
              title: `${msg.emojis.success}I have successfully banned ${membersBanned.length} member(s)!`,
              description: `
**Members Banned**: ${membersBanned.join(", ")}\n
${Object.keys(membersFailed).length > 0 ? `**Members Failed**: ${Object.keys(membersFailed).join(", ")}` : ``}`,
              color: msg.colors.success
            }
          });
        } else if (membersBanned.length < 1 && Object.keys(membersFailed).length > 0) {
          msg.channel.send({
            embed: {
              title: `${msg.emojis.fail}I have failed to ban ${members.size} members!`,
              description: `**Members Failed**: ${Object.keys(membersFailed).join(", ")}`,
              color: msg.colors.fail
            }
          });
        }
      }
    }
  }
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: "Ban a member, with optional reasoning and number of days of messages to delete.",
  aliases: [],
  userPermissions: ["administrator"],
  botPermissions: ["ban_members"],
  runIn: ["text"]
};