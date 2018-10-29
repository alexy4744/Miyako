const Task = require("../modules/Base/Task");

module.exports = class TimedBans extends Task {
  constructor(...args) {
    super(...args, {
      interval: 5000
    });
  }

  async run() {
    const cache = this.client.cache;

    if (cache && cache.bannedMembers) {
      for (const member of cache.bannedMembers) {
        if (!this.client.guilds.has(member.guildId)) { // If the bot is still in the guild the member that was originally banned in.
          await this.removeFromDatabase(cache, member.memberId);
          continue;
        }

        if (!member.bannedUntil) continue; // If it is not a timed ban.

        if (Date.now() >= member.bannedUntil) { // If the current date is already passed the specified ban duration, unban this member.
          const unban = await this.client.guilds.get(member.guildId).members.unban(member.memberId).catch(e => ({ "error": e }));

          if (unban.error) {
            if (unban.error.message === "Unknown Ban") await this.removeFromDatabase(cache, member.memberId);
            continue;
          }

          await this.removeFromDatabase(cache, member.memberId);
        } else continue; // eslint-disable-line
      }
    }
  }

  async removeFromDatabase(cache, memberId) {
    const index = cache.bannedMembers.findIndex(el => el.memberId === memberId);

    if (index > -1) {
      cache.bannedMembers.splice(index, 1);
      await this.client.updateDatabase(cache).catch(() => { });
    }
  }
};