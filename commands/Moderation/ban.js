const Command = require("../../modules/Base/Command");
const moment = require("moment");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Ban a member with optional reasoning and days of messages to delete.`,
      usage: msg => [`${msg.client.user.toString()}`, `${msg.author.toString()} 7`, `${msg.client.user.toString()} 3 this bot sucks`],
      aliases: [],
      userPermissions: ["BAN_MEMBERS"],
      botPermissions: ["BAN_MEMBERS"],
      runIn: ["text"]
    });
  }

  async run(msg, args) {
    const member = msg.mentions.members.size > 0 ? msg.mentions.members.first() : args[0] !== undefined ? args[0] : null; // eslint-disable-line
    args = args.filter(arg => (member instanceof Object) ? arg !== member.toString() : arg !== member); // Remove member from array of arguments
    const days = args[0] ? this.client.utils.stringToMillis.isValid(args[0]) ? this.client.utils.stringToMillis.convert(args[0]).ms : null : null; // eslint-disable-line
    const reason = days ? args.slice(1).join(" ") : args.join(" ").length > 0 ? args.join(" ") : null; // If days were specified, remove first 2 elements, else remove 1 and then join the whole array.

    if (member) {
      if (msg.guild.members.has(args[0])) { // If it is a user snowflake
        return this.ban(msg.guild.members.get(args[0]), days, reason);
      } else if (member instanceof Object) { // If it is a object, then it has to be a mention, since it is the only time "member" is a member object
        try {
          await this.ban(member, days, reason);
          return msg.success(`I have successfully banned ${member.user.tag}!`, `Reason: ${reason || `Not Specified`}\n\n${days ? `Banned Until: ${moment(Date.now() + days).format("dddd, MMMM Do, YYYY, hh:mm:ss A")}` : ``}`);
        } catch (error) {
          return msg.error(error);
        }
      } else { // If it is a username
        const guildMember = msg.guild.findMember(member);

        if (!guildMember.bannable) return msg.fail(`I do not have the privilege to ban ${guildMember.user.tag}!`, `Please make sure that this member's permissions or roles are not higher than me in order for me to ban them!`);

        const message = await msg.channel.send({
          embed: {
            title: `${msg.emojis.pending}Are you sure you want to ban ${guildMember.user.tag}?`,
            description: `User ID: \`${guildMember.id}\`\n\nRespond with **${msg.guild.me.hasPermission("ADD_REACTIONS") ? "👌" : "YES"}** to ban this member or **${msg.guild.me.hasPermission("ADD_REACTIONS") ? "❌" : "NO"}** to cancel the command within **15** seconds`,
            thumbnail: { "url": guildMember.user.getAvatar(512) },
            color: msg.colors.pending
          }
        });

        const confirmation = await message
          .prompt(msg.author.id, { "emojis": { "yes": "👌" } })
          .catch(error => ({ error }));

        if (confirmation.error) return msg.cancelledCommand(`${msg.author.toString()} has failed to provide a response within **15** seconds, therefore I have cancelled the command!`);

        if (confirmation) {
          try {
            await this.ban(guildMember, days, reason);
            return msg.success(`I have successfully banned ${guildMember.user.tag}!`, `Reason: ${reason || `Not Specified`}\n\n${days ? `Banned Until: ${moment(Date.now() + days).format("dddd, MMMM Do, YYYY, hh:mm:ss A")}` : ``}`);
          } catch (error) {
            return msg.error(error);
          }
        }

        return msg.cancelledCommand();
      }
    } else {
      return msg.fail(`Please mention the member or enter their username/ID in order for me to ban them!`);
    }
  }

  async ban(guildMember, days, reason) {
    if (!guildMember.bannable) return Promise.reject(new Error("This guild member is not bannable!"));

    // Put the data into the db first before banning, that way if the database fails, the member doesn't get banned.
    if (days) { // Only save it to the database if this is a timed ban.
      const clientCache = this.client.cache;
      if (!(clientCache.bannedMembers instanceof Array)) clientCache.bannedMembers = [];

      // If this user is not found in the array of banned members.
      // Don't let the user ban without putting it in the database first.
      if (clientCache.bannedMembers.findIndex(el => el.memberId === guildMember.id) < 0) {
        clientCache.bannedMembers.push({
          "memberId": guildMember.id,
          "guildId": guildMember.guild.id,
          "bannedUntil": Date.now() + days
        });

        try {
          await this.client.updateDatabase(clientCache);
        } catch (error) {
          return Promise.reject(error);
        }
      }
    }

    try {
      await guildMember.ban({ reason });
    } catch (error) {
      // Only revert database if it is a timed ban.
      // Ignoring errors because I can check if this member is actually banned later in my loop
      if (days) {
        const clientCache = this.client.cache;
        const index = clientCache.bannedMembers.findIndex(el => el.memberId === guildMember.id);

        if (index > -1) {
          try {
            clientCache.bannedMembers.splice(index, 1);
            await this.client.updateDatabase(clientCache);
          } catch (err) {
            // noop
          }
        }
      }
    }

    return Promise.resolve({
      guildId: guildMember.id,
      reason,
      days
    });
  }
};