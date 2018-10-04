/* eslint no-use-before-define: 0 */

module.exports = client => {
  client.setInterval(async () => { // Using setInterval from client so that if the client gets destroyed, it will stop the interval.
    const cache = client.myCache;

    if (cache && cache.bannedMembers) {
      for (const member of cache.bannedMembers) {
        if (!client.guilds.has(member.guildId) || !client.guilds.get(member.guildId).members.has(member.memberId)) { // If the bot is still in the guild the member that was originally banned in.
          removeFromDatabase(cache, member);
          continue;
        }
        if (!member.bannedUntil) continue; // If it is not a timed ban.

        if (Date.now() >= member.bannedUntil) { // If the current date is already passed the specified ban duration, unban this member.
          const fetchedUser = await client.users.fetch(member.memberId).catch(e => ({ "error": e }));

          if (fetchedUser.error) {
            // If this user does not exist in Discord anymore, remove it from the database.
            if (fetchedUser.error && fetchedUser.error.message === "Unknown User") removeFromDatabase(cache, member);
            continue;
          }

          const unban = await client.guilds.get(member.guildId).members.unban(fetchedUser).catch(e => ({ "error": e }));

          if (unban.error) {
            if (unban.error.message === "Unknown Ban") removeFromDatabase(cache, member);
            continue;
          }

          try {
            removeFromDatabase(cache, member);
          } catch (error) {
            continue;
          }
        } else continue; // eslint-disable-line
      }
    }
  }, 5000);

  function removeFromDatabase(cache, member) {
    const index = cache.mutedMembers.findIndex(el => el.memberId === member.memberId);

    if (index > -1) {
      cache.mutedMembers.splice(index, 1);
      return updateDatabase(cache);
    }
  }

  async function updateDatabase(cache) {
    try {
      await client.db.update("client", cache);
    } catch (error) {
      // Ignore all errors as it can try again in the next interval.
    }
  }
};