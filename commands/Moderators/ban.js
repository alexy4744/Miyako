/* eslint no-use-before-define: 0 */
/* eslint no-confusing-arrow: 0 */

module.exports.run = async (client, msg, args) => {
  const member = msg.mentions.members.size > 0 ? msg.mentions.members.first() : args[0] !== undefined ? args[0] : null; // eslint-disable-line
  args = args.filter(arg => (member instanceof Object) ? arg !== member.toString() : arg !== member); // Remove member from array of arguments
  const days = !isNaN(args[0]) ? parseInt(args[0]) : null; // eslint-disable-line
  // const days = args[0].length === 2 ? !isNaN(args[0][0])
  const reason = days ? args.slice(1).join(" ") : args.join(" "); // If days were specified, remove first 2 elements, else remove 1 and then join the whole array.

  if (days && days < 1) return msg.fail(`Sorry ${msg.author.username}, timed bans must be at least 1 day, but not greater than !`);

  if (member) {
    if (msg.guild.members.has(args[0])) { // If it is a user snowflake
      return ban(msg.guild.members.get(args[0]));
    } else if (member instanceof Object) { // If it is a object, then it has to be a mention, since it is the only time "member" is a member object
      ban(member);
    } else { // If it is a username
      const yes = msg.guild.me.hasPermission("ADD_REACTIONS") ? "👌" : `YES`;
      const no = msg.guild.me.hasPermission("ADD_REACTIONS") ? "❌" : `NO`;
      const guildMember = msg.guild.findMember(member);
      const m = await msg.channel.send({
        embed: {
          title: `${msg.emojis.pending}Are you sure you want to ban ${guildMember.user.tag}?`,
          description: `**User ID**: \`${guildMember.user.id}\`\n\nYou have **15** seconds to respond with ${yes} to ban this member, or ${no} to cancel this command.`,
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

          if (emoji.first().emoji.name === yes) return ban(guildMember);
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

          if (message.first().content === y) return ban(guildMember);
          else if (message.first().content === n) return m.cancelledCommand();
        }).catch(async () => {
          await m.delete().catch(() => { });
          return m.cancelledCommand(`${msg.author.toString()} did not react with ${yes} or ${no} within **15** seconds, therefore this command has been cancelled!`);
        });
      }
    }
  } else {
    return msg.fail(`Please mention the member or enter their username/ID in order for me to ban them!`);
  }

  async function ban(guildMember) {
    // Put the data into the db first before banning, that way if the database fails, the member doesn't get banned.
    if (guildMember.bannable) {
      const clientData = await client.db.get().catch(e => ({
        "error": e
      }));

      if (!clientData || !(clientData.bannedMembers instanceof Object)) clientData.bannedMembers = {};

      clientData.bannedMembers[guildMember.id] = {
        "guildId": msg.guild.id,
        "reason": reason.length > 0 ? reason : null,
        "bannedBy": msg.author.id,
        "bannedOn": Date.now(),
        // 1 day is equivalent to 8.64e+7 ms, so multiply it by number of days specified and add that to the current date, and we get when to unban this member.
        "bannedUntil": !isNaN(days) ? Date.now() + (days * 8.64e+7) : null
      };

      const databaseUpdate = await client.db.update({
        "bannedMembers": clientData.bannedMembers
      }).catch(e => ({
        "error": e
      }));

      const updateCache = await client.updateCache("bannedMembers", client.bannedMembers).catch(e => ({
        "error": e
      }));

      if (databaseUpdate.error || updateCache.error) return msg.error(databaseUpdate.error ? databaseUpdate.error : updateCache.error, `ban ${guildMember.user.tag}!`);

      guildMember.ban({
        "reason": reason.length < 1 ? null : reason
      }).then(() => msg.success(`I have successfully banned ${guildMember.user.tag}!`, `**Reason**: ${reason.length > 0 ? reason : `Not Specified`}\n\n${days ? `**Banned Until**: ${days}` : ``}`))
        .catch(async e => { // If it fails to ban this member, the database must be reverted before this member was added to the ban list.
          delete clientData.bannedMembers[guildMember.id];
          await client.db.update({
            "bannedMembers": clientData.bannedMembers
          }).then(() => client.updateCache("bannedMembers", clientData.bannedMembers).catch(() => { }))
            .catch(() => { });

          return msg.error(e, `ban ${guildMember.user.tag}!`);
        });
    } else {
      return msg.fail(`I do not have the privilege to ban ${guildMember.user.tag}!`, `Please make sure that this member's permissions or roles are not higher than me in order for me to ban them!`);
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
  description: () => `Ban a member with optional reasoning and days of messages to delete.`,
  usage: msg => [`${msg.client.user.toString()}`, `${msg.author.toString()} 7`, `${msg.client.user.toString()} 3 this bot sucks`],
  aliases: [],
  userPermissions: ["BAN_MEMBERS"],
  botPermissions: ["BAN_MEMBERS"],
  runIn: ["text"]
};