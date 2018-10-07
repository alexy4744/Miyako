/* eslint curly: 0 */

module.exports = client => {
  const updateDatabase = async cache => {
    try {
      await client.db.update("client", cache);
    } catch (error) {
      // Ignore all errors as it can try again in the next interval.
    }
  };

  const removeFromDatabase = (cache, memberId) => {
    const index = cache.mutedMembers.findIndex(el => el.memberId === memberId);

    if (index > -1) {
      cache.mutedMembers.splice(index, 1);
      return updateDatabase(cache);
    }
  };

  client.setInterval(async () => { // Using setInterval from client so that if the client gets destroyed, it will stop the interval.
    const cache = client.myCache;

    if (cache && cache.mutedMembers instanceof Array) {
      for (const member of cache.mutedMembers) {
        if (!client.guilds.has(member.guildId) || !client.guilds.get(member.guildId).roles.has(member.muteRole)) {
          removeFromDatabase(cache, member.memberId);
          continue;
        }
        if (!member.mutedUntil) continue; // If it is not a timed mute.

        if (Date.now() >= member.mutedUntil) { // If the current date is already passed the specified ban duration, unban this member.
          const guild = client.guilds.get(member.guildId);
          const fetchedMember = await guild.members.fetch(member.memberId).catch(e => ({ "error": e }));

          if (fetchedMember.error) {
            // If this user does not exist in Discord anymore, remove it from the database.
            if (fetchedMember.error && fetchedMember.error.message === "Unknown User") removeFromDatabase(cache, member.memberId);
            continue;
          }

          if (fetchedMember.roles.has(member.muteRole)) {
            try {
              await fetchedMember.roles.remove(member.muteRole, "Timed mute has expired.");
              removeFromDatabase(cache, member.memberId);
            } catch (error) {
              continue;
            }
          } else removeFromDatabase(cache, member.memberId);
        }
      }
    }
  }, 5000);
};