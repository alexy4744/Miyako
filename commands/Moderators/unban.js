/* eslint no-use-before-define: 0 */

module.exports.run = async (client, msg, args) => {
  const bannedMembers = await msg.guild.fetchBans().catch(e => ({
    "error": e
  }));

  if (bannedMembers.error) return msg.error(bannedMembers.error, "fetch banned members!");
  if (bannedMembers.size < 1) return msg.fail(`There are no banned members in this guild!`);

  if (!isNaN(args[0]) && args[0].length === 18) { // If it is a user snowflake
    if (bannedMembers.has(args[0])) {
      const guyToUnban = bannedMembers.get(args[0]);
      msg.guild.members.unban(guyToUnban.user)
        .then(() => msg.success(`${guyToUnban.user.tag}(${guyToUnban.user.id}) has been unbanned by ${msg.author.tag}!`))
        .catch(e => msg.error(e, `unban ${guyToUnban.user.username}!`));
    } else msg.fail(`I cannot find any banned members with the user ID **${args[0]}**!`); // eslint-disable-line
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
      const yes = msg.guild.me.hasPermission("ADD_REACTIONS") ? "👌" : `YES`;
      const no = msg.guild.me.hasPermission("ADD_REACTIONS") ? "❌" : `NO`;
      const m = await msg.channel.send({
        embed: {
          title: `${msg.emojis.pending}Are you sure you want to unban ${currentMember.user.tag}?`,
          description: `**User ID**: \`${currentMember.user.id}\`\n\nYou have **15** seconds to respond with ${yes} to unban this member, or ${no} to cancel this command.`,
          thumbnail: {
            "url": currentMember.user.getAvatar()
          },
          color: msg.colors.pending
        }
      });

      if (m.guild.me.hasPermission("ADD_REACTIONS")) {
        const filter = (reaction, user) => (reaction.emoji.name === yes || reaction.emoji.name === no) && user.id === msg.author.id;

        await m.react(yes);
        await m.react(no);

        m.awaitReactions(filter, {
          "time": 15000,
          "max": 1,
          "maxEmojis": 1,
          "maxUsers": 1,
          "errors": ["time"]
        }).then(async emoji => {
          await m.delete().catch(() => { });

          if (emoji.first().emoji.name === yes) return unban(currentMember);
          else if (emoji.first().emoji.name === no) return m.cancelledCommand();
        }).catch(async () => {
          await m.delete().catch(() => { });
          return m.cancelledCommand(`${msg.author.toString()} did not react with ${yes} or ${no} within **15** seconds, therefore this command has been cancelled!`);
        });
      } else {
        const y = yes.replace(/`/gi, "");
        const n = no.replace(/`/gi, "");
        const filter = message => (message.content === y || message.content === n) && message.author.id === msg.author.id;

        m.channel.awaitMessages(filter, {
          "time": 15000,
          "max": 1,
          "errors": ["time"]
        }).then(async message => {
          await m.delete().catch(() => { });

          if (message.first().content === y) return unban(currentMember);
          else if (message.first().content === n) return m.cancelledCommand();
        }).catch(async () => {
          await m.delete().catch(() => { });
          return m.cancelledCommand(`${msg.author.toString()} did not react with ${yes} or ${no} within **15** seconds, therefore this command has been cancelled!`);
        });
      }
    }
  }

  function unban(member) {
    // Unban first because i can always check if this member still exists because i can skip in loop later.
    return msg.guild.members.unban(member.user).then(async () => {
      // Don't really care if it anything errors in here, I can always remove it later while checking for timed bans.
      const clientData = await client.db.get().catch(() => ({
        "error": "(ノಠ益ಠ)ノ彡┻━┻"
      }));

      if (!clientData.error && clientData.bannedMembers instanceof Array) {
        const index = clientData.bannedMembers.findIndex(el => el.memberId === member.user.id);

        if (index > -1) {
          clientData.bannedMembers.splice(index, 1);
          client.db.update({
            "bannedMembers": clientData.bannedMembers
          }).then(() => client.updateCache("bannedMembers", clientData.bannedMembers).catch(() => null))
            .catch(e => console.log(e));
        }
      }

      return msg.success(`I have successfully unbanned ${member.user.tag}!`);
    }).catch(e => msg.error(e, `unban ${member.user.tag}!`));
  }
};

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: () => `Unban a member their user ID, or by searching for a banned member using their username`,
  usage: msg => [`${msg.client.user.id}`, `${msg.author.username}`],
  aliases: [],
  userPermissions: ["BAN_MEMBERS"],
  botPermissions: ["BAN_MEMBERS"],
  runIn: ["text"]
};