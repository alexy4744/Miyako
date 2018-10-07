module.exports = client => {
  const updateDatabase = async cache => {
    try {
      await client.db.update("client", cache);
    } catch (error) {
      // Ignore all errors as it can try again in the next interval.
    }
  };

  const removeFromDatabase = (cache, memberId) => {
    const index = cache.bannedMembers.findIndex(el => el.memberId === memberId);

    if (index > -1) {
      cache.bannedMembers.splice(index, 1);
      return updateDatabase(cache);
    }
  };

  client.setInterval(async () => { // Using setInterval from client so that if the client gets destroyed, it will stop the interval.
    const cache = client.myCache;

    if (cache && cache.bannedMembers) {
      for (const member of cache.bannedMembers) {
        if (!client.guilds.has(member.guildId)) { // If the bot is still in the guild the member that was originally banned in.
          removeFromDatabase(cache, member.memberId);
          continue;
        }

        if (!member.bannedUntil) continue; // If it is not a timed ban.

        if (Date.now() >= member.bannedUntil) { // If the current date is already passed the specified ban duration, unban this member.
          const unban = await client.guilds.get(member.guildId).members.unban(member.memberId).catch(e => ({ "error": e }));

          if (unban.error) {
            if (unban.error.message === "Unknown Ban") removeFromDatabase(cache, member.memberId);
            continue;
          }

          try {
            removeFromDatabase(cache, member.memberId);
          } catch (error) {
            continue;
          }
        } else continue; // eslint-disable-line
      }
    }
  }, 5000);
};