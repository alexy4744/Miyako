module.exports.run = async (client, msg, args) => {
  const bannedMembers = await msg.guild.fetchBans().catch(e => msg.error(e, "fetch the ban log!"));

  if (bannedMembers.size < 1) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}There are no banned members in this guild!`,
        color: msg.colors.fail
      }
    });
  }

  if (!isNaN(args[0]) && args[0].length === 18) { // If it is a user snowflake
    if (bannedMembers.has(args[0])) {
      const guyToUnban = bannedMembers.get(args[0]);
      msg.guild.members.unban(guyToUnban.user).then(guy => msg.channel.send({
        embed: {
          title: `${msg.emojis.success}${guy.tag}(${guy.id}) has been unbanned by ${msg.author.tag}!`, // eslint-disable-line
          color: msg.colors.success
        }
      })).catch(e => msg.error(e, `unban ${guyToUnban.user.username}!`));
    } else {
      msg.channel.send({
        embed: {
          title: `${msg.emojis.fail}I cannot find any banned members with the user ID **${args[0]}**!`,
          color: msg.colors.fail
        }
      });
    }
  } else {
    const lastMember = Array.from(bannedMembers.values()).pop();
    let outcome = 0;
    let chosenMember = null;
    let currentMember = null;

    for (const banned of bannedMembers) {
      const compared = client.utils.compareStrings(banned[1].user.username, args.join(" ")).finalOutcome;
      currentMember = banned[1]; // Keep track of the current member so that it knows when to return the final member.

      if (!chosenMember || compared > outcome) {
        chosenMember = banned[1];
        outcome = compared;
      } else continue; // eslint-disable-line
    }

    if (currentMember === lastMember) {
      msg.channel.send({
        embed: {
          title: `${msg.emojis.pending}Are you sure you want to unban ${currentMember.user.tag}?`,
          description: `**User ID**: \`${currentMember.user.id}\`\n\nYou have **15** seconds to respond with \`YES\` to unban this member, or \`NO\` to cancel this command.`,
          thumbnail: {
            "url": currentMember.user.displayAvatarURL()
          },
          color: msg.colors.pending
        }
      }).then(confirmationMessage => {
        const filter = message => (message.content === "YES" || message.content === "NO") && message.author.id === msg.author.id;
        msg.channel.awaitMessages(filter, {
          max: 1,
          time: 15000,
          errors: ["time"]
        }).then(async m => {
          if (m.first().content === "YES") {
            msg.guild.members.unban(currentMember.user).then(async guy => {
              await confirmationMessage.delete().catch(() => {});
              msg.channel.send({
                embed: {
                  title: `${msg.emojis.success}${guy.tag} has been successfully unbanned by ${msg.author.tag}!`,
                  color: msg.colors.success
                }
              });
            }).catch(e => msg.error(e, `unban ${currentMember.user.tag}`));
          } else if (m.first().content === "NO") {
            await confirmationMessage.delete().catch(() => {});
            return msg.channel.send({
              embed: {
                title: `${msg.emojis.success}Command has been successfully cancelled!`,
                color: msg.colors.success
              }
            });
          }
        }).catch(() => msg.channel.send({
          embed: {
            title: `${msg.emojis.fail}This command has been cancelled!`,
            description: `I did not receive a \`YES\` or \`NO\` input from ${msg.author.username} within **15** seconds, therefore, I have cancelled the command.`,
            color: msg.colors.fail
          }
        }));
      });
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
  usage: (prefix, client) => `${prefix}unban ${client.user.username}`,
  aliases: [],
  userPermissions: ["ban_members"],
  botPermissions: ["ban_members"],
  runIn: ["text"]
};