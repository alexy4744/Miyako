const Command = require("../../modules/Base/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Unban a member their user ID, or by searching for a banned member using their username`,
      usage: msg => [`${msg.client.user.id}`, `${msg.author.username}`],
      aliases: [],
      userPermissions: ["BAN_MEMBERS"],
      botPermissions: ["BAN_MEMBERS"],
      runIn: ["text"]
    });
  }

  async run(msg, args) {
    const bannedMembers = await msg.guild.fetchBans().catch(error => ({ error }));

    if (bannedMembers.error) return msg.error(bannedMembers.error, "fetch banned members!");
    if (bannedMembers.size < 1) return msg.fail(`There are no banned members in this guild!`);

    if (bannedMembers.has(args[0])) { // If it is a user snowflake
      try {
        await unban(bannedMembers.get(args[0]));
        return msg.success(`I have successfully unbanned ${bannedMembers.get(args[0]).user.tag}!`);
      } catch (error) {
        return msg.error(error);
      }
    } else {
      const lastMember = Array.from(bannedMembers.values()).pop();

      let outcome = 0;
      let chosenMember = null;
      let currentMember = null;

      for (const banned of bannedMembers) {
        const compared = this.client.utils.compareStrings(banned[1].user.username, args.join(" ")).finalOutcome;
        currentMember = banned[1]; // Keep track of the current member so that it knows when to return the final member.

        if (!chosenMember || compared > outcome) {
          chosenMember = banned[1];
          outcome = compared;
        } else continue; // eslint-disable-line
      }

      if (currentMember === lastMember) {
        const message = await msg.channel.send({
          embed: {
            title: `${msg.emojis.pending}Are you sure you want to unban ${currentMember.user.tag}?`,
            description: `User ID: \`${currentMember.id}\`\n\nRespond with **${msg.guild.me.hasPermission("ADD_REACTIONS") ? "👌" : "YES"}** to unban this member or **${msg.guild.me.hasPermission("ADD_REACTIONS") ? "❌" : "NO"}** to cancel the command`,
            thumbnail: { "url": currentMember.user.getAvatar(512) },
            color: msg.colors.pending
          }
        });

        const confirmation = await message
          .prompt(msg.author.id, { "emojis": { "yes": "👌" } })
          .catch(error => ({ error }));

        if (confirmation.error) return msg.cancelledCommand(`${msg.author.toString()} has failed to provide a response within **15** seconds, therefore I have cancelled the command!`);

        if (confirmation) {
          try {
            await unban(currentMember);
            return msg.success(`I have successfully unbanned ${currentMember.user.tag}!`);
          } catch (error) {
            return msg.error(error);
          }
        } else {
          return msg.cancelledCommand();
        }
      }
    }

    async function unban(member) {
      try {
        await msg.guild.members.unban(member.user);
      } catch (error) {
        return Promise.reject(error);
      }

      const clientData = await msg.client.db.get().catch(error => ({ error }));

      if (!clientData.error && clientData.bannedMembers instanceof Array) {
        const index = clientData.bannedMembers.findIndex(el => el.memberId === member.user.id);

        if (index > -1) {
          try {
            clientData.bannedMembers.splice(index, 1);
            await this.client.updateDatabase({ "bannedMembers": clientData.bannedMembers });
          } catch (error) {
            // noop, ignore errors since it will be deleted by task
          }
        }
      }

      return Promise.resolve();
    }
  }
};