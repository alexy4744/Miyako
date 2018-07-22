/* eslint no-use-before-define: 0 */
/* eslint curly: 0 */

module.exports = client => {
  client.setInterval(async () => {
    if (client.cache && client.cache.bannedMembers) {
      for (const member of client.cache.bannedMembers) {
        if (!member.bannedUntil) continue; // If it is not a timed ban.
        if (Date.now() >= member.bannedUntil) { // If the current date is already passed the specified ban duration, unban this member.
          const clientData = await client.db.get().catch(() => ({
            "error": ":("
          }));

          if (clientData.error) continue; // If it errors, skip this iteration and try to unban again in the next interval.

          if (client.guilds.has(member.guildId)) { // If the bot is still in the guild the member that was originally banned in.
            const fetchedUser = await client.users.fetch(member.memberId).catch(e => ({
              "error": e
            }));

            if (fetchedUser.error) {
              // If this user does not exist in Discord anymore, remove it from the database.
              if (fetchedUser.error && fetchedUser.error.message === "Unknown User") removeFromDatabase(clientData, member);
              continue;
            } else {
              client.guilds.get(member.guildId).members.unban(fetchedUser)
                .then(() => removeFromDatabase(clientData, member))
                .catch(e => {
                  // If this ban doesn't exist and it is still in the database, then remove it, else add it back in and try removing this entry in the next iteration.
                  if (e.message === "Unknown Ban") removeFromDatabase(clientData, member);
                  else addToDatabase(clientData, member);
                });
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

  function addToDatabase(clientData, member) {
    const index = clientData.bannedMembers.findIndex(el => el.memberId === member.memberId);

    if (index < 0) {
      clientData.bannedMembers.push(member);
      return updateDatabase(clientData.bannedMembers);
    }
  }

  async function updateDatabase(bannedMembers) {
    try {
      await client.db.update({
        "bannedMembers": bannedMembers
      });
      await client.updateCache("bannedMembers", bannedMembers);
    } catch (error) {
      // Ignore all errors as it can try again in the next interval.
      return null;
    }
  }
};