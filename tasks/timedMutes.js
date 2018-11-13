const Task = require("../modules/Base/Task");

module.exports = class TimedMutes extends Task {
  constructor(...args) {
    super(...args, {
      interval: 5000
    });
  }

  async run() {
    const cache = this.client.cache;

    if (cache && cache.mutedMembers instanceof Array) {
      for (const member of cache.mutedMembers) {
        if (!this.client.guilds.has(member.guildId) || (this.client.guilds.has(member.guildId) && !this.client.guilds.get(member.guildId).roles.has(member.muteRole))) continue;

        if (Date.now() >= member.mutedUntil) { // If the current date is already passed the specified ban duration, unban this member.
          const guild = this.client.guilds.get(member.guildId);
          const fetchedMember = await guild.members.fetch(member.memberId).catch(e => ({ "error": e }));

          if (fetchedMember.error) {
            // If this user does not exist in Discord anymore, remove it from the database.
            if (fetchedMember.error && fetchedMember.error.message === "Unknown User") await this.removeFromDatabase(cache, member.memberId);
            continue;
          }

          if (fetchedMember.roles.has(member.muteRole)) {
            await fetchedMember.roles.remove(member.muteRole, "Timed mute has expired.");
            await this.removeFromDatabase(cache, member.memberId);
          } else {
            await this.removeFromDatabase(cache, member.memberId);
          }
        }
      }
    }
  }

  async removeFromDatabase(cache, memberId) {
    const index = cache.mutedMembers.findIndex(el => el.memberId === memberId);

    if (index > -1) {
      cache.mutedMembers.splice(index, 1);
      await this.client.updateDatabase(cache).catch(() => { });
    }
  }
};