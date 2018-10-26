/* eslint no-use-before-define: 0 */
/* eslint no-confusing-arrow: 0 */

const Command = require("../../modules/Base/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Kick a member.`,
      usage: msg => [`${msg.client.user.id}`, `${msg.author.username}`],
      aliases: [],
      userPermissions: ["KICK_MEMBERS"],
      botPermissions: ["KICK_MEMBERS"],
      runIn: ["text"]
    });
  }

  async run(msg, args) {
    const member = msg.mentions.members.size > 0 ? msg.mentions.members.first() : args[0] !== undefined ? args[0] : null; // eslint-disable-line
    args = args.filter(arg => (member instanceof Object) ? arg !== member.toString() : arg !== member); // Remove member from array of arguments
    const reason = args.join(" ").length > 0 ? args.join(" ") : null; // If days were specified, remove first 2 elements, else remove 1 and then join the whole array.

    if (member) {
      if (msg.guild.members.has(args[0])) { // If it is a user snowflake
        return kick(msg.guild.members.get(args[0]));
      } else if (member instanceof Object) { // If it is a object, then it has to be a mention, since it is the only time "member" is a member object
        kick(member);
      } else { // If it is a username
        const guildMember = msg.guild.findMember(member);

        if (!guildMember.bannable) return msg.fail(`I do not have the privilege to ban ${guildMember.user.tag}!`, `Please make sure that this member's permissions or roles are not higher than me in order for me to ban them!`);

        const message = await msg.channel.send({
          embed: {
            title: `${msg.emojis.pending}Are you sure you want to ban ${guildMember.user.tag}?`,
            description: `User ID: \`${guildMember.id}\`\n\nRespond with **${msg.guild.me.hasPermission("ADD_REACTIONS") ? "👌" : "YES"}** to ban this member or **${msg.guild.me.hasPermission("ADD_REACTIONS") ? "❌" : "NO"}** to cancel the command within **15** seconds`,
            thumbnail: {
              "url": guildMember.user.getAvatar(512)
            },
            color: msg.colors.pending
          }
        });

        const confirmation = await message.prompt(msg.author.id, {
          "emojis": {
            "yes": "👌"
          }
        }).catch(e => ({
          "error": e
        }));

        if (confirmation.error) return msg.cancelledCommand(`${msg.author.toString()} has failed to provide a response within **15** seconds, therefore I have cancelled the command!`);
        if (confirmation) return kick(guildMember);
        return msg.cancelledCommand();
      }
    } else {
      return msg.fail(`Please mention the member or enter their username/ID in order for me to kick them!`);
    }

    async function kick(guildMember) {
      if (guildMember.kickable) {
        try {
          await guildMember.kick(reason);
          return msg.success(`${guildMember.user.tag} has been succesfully kicked by ${msg.author.tag}!`, `${reason ? `**Reason**: ${reason}` : ``}`);
        } catch (error) {
          return msg.error(error, `kick ${guildMember.user.tag}!`);
        }
      } else {
        msg.fail("I can't kick a member with higher privilege/roles than me!");
      }
    }
  }
};