const Command = require("../../modules/Base/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      checkVC: false,
      cooldown: 5,
      description: () => `Adds/removes a DJ. Adding a DJ will disable music controls to everyone else except DJs and admins.`,
      aliases: [],
      subcommands: ["add", "remove"],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  run(msg, args) {
    if (msg.mentions.members.size < 1 && !args[1]) {
      msg.fail("You must supply a member to be added as a DJ!");
      return false;
    }

    return true;
  }

  async add(msg, args) {
    const member = msg.mentions.members.first() || msg.guild.findMember(args.join(" "));
    if (!member) return msg.fail(`I could not find a member named "${args.join(" ")}"`);

    const cache = msg.guild.cache;
    if (!cache.djs) cache.djs = [];

    cache.djs.push(member.id);

    try {
      await msg.guild.updateDatabase(cache);
      return msg.success(`I have added ${member.user.tag} as a DJ!`);
    } catch (error) {
      return msg.error("add DJs", error);
    }
  }

  async remove(msg, args) {
    if (!msg.guild.cache.djs || msg.guild.cache.djs.length < 1) return msg.fail("There are no assigned DJs!");

    const member = msg.mentions.members.first() || msg.guild.findMember(args.join(" "));
    if (!member) return msg.fail(`I could not find a member named "${args.join(" ")}"`);

    const cache = msg.guild.cache;
    const index = cache.djs.findIndex(dj => dj === member.id);

    if (index < 0) return msg.fail("This user is not an assigned DJ!");

    cache.djs.splice(index, 1);

    try {
      await msg.guild.updateDatabase(cache);
      return msg.success(`I have removed ${member.user.tag} as a DJ!`);
    } catch (error) {
      return msg.error("remove DJs", error);
    }
  }
};