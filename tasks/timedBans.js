/* eslint no-use-before-define: 0 */
/* eslint curly: 0 */

module.exports = client => {
  client.setInterval(async () => { // Using setInterval from client so that if the client gets destroyed, it will stop the interval.
    const cache = client.cache.get(process.env.BOTID);
    if (cache && cache.bannedMembers) {
      for (const member of cache.bannedMembers) {
        if (!member.bannedUntil) continue; // If it is not a timed ban.
        if (Date.now() >= member.bannedUntil) { // If the current date is already passed the specified ban duration, unban this member.
          const clientData = await client.db.get().catch(e => ({ "error": e }));

          if (clientData.error) continue; // If it errors, skip this iteration and try to unban again in the next interval.

          if (client.guilds.has(member.guildId)) { // If the bot is still in the guild the member that was originally banned in.
            const fetchedUser = await client.users.fetch(member.memberId).catch(e => ({ "error": e }));

            if (fetchedUser.error) {
              // If this user does not exist in Discord anymore, remove it from the database.
              if (fetchedUser.error && fetchedUser.error.message === "Unknown User") removeFromDatabase(clientData, member);
            } else {
              const unban = await client.guilds.get(member.guildId).members.unban(fetchedUser).catch(e => ({
                "error": e
              }));

              if (unban.error) {
                if (unban.error.message === "Unknown Ban") return removeFromDatabase(clientData, member);
                else continue; // eslint-disable-line
              }

              try {
                removeFromDatabase(clientData, member);
              } catch (error) {
                // noop
              }
            }
          } else {
            removeFromDatabase(clientData, member);
            continue;
          }
        } else continue;
      }
    }
  }, 5000);

  function removeFromDatabase(clientData, member) {
    const index = clientData.bannedMembers.findIndex(el => el.memberId === member.memberId);

    if (index > -1) {
      clientData.bannedMembers.splice(index, 1);
      return updateDatabase(clientData.bannedMembers);
    }
  }

  async function updateDatabase(bannedMembers) {
    try {
      await client.db.update({ "bannedMembers": bannedMembers });
    } catch (error) {
      // Ignore all errors as it can try again in the next interval.
    }
  }
};