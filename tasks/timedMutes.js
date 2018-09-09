/* eslint no-use-before-define: 0 */
/* eslint curly: 0 */

module.exports = client => {
  client.setInterval(async () => { // Using setInterval from client so that if the client gets destroyed, it will stop the interval.
    const cache = client.cache.get(process.env.BOTID);
    if (cache && cache.mutedMembers) {
      for (const member of cache.mutedMembers) {
        if (!member.mutedUntil) continue; // If it is not a timed mute.

        if (Date.now() >= member.mutedUntil) { // If the current date is already passed the specified ban duration, unban this member.
          const clientData = await client.db.get().catch(e => ({ "error": e }));
          if (clientData.error) continue; // If it errors, skip this iteration and try to unban again in the next interval.

          if (client.guilds.has(member.guildId) && client.guilds.get(member.guildId).roles.has(member.muteRoleId)) { // If the bot is still in the guild the member that was originally banned in.
            const guild = client.guilds.get(member.guildId);
            const role = guild.roles.get(member.muteRoleId);
            const fetchedMember = await guild.members.fetch(member.memberId).catch(e => ({ "error": e }));

            if (fetchedMember.error) {
              // If this user does not exist in Discord anymore, remove it from the database.
              if (fetchedMember.error && fetchedMember.error.message === "Unknown User") removeFromDatabase(clientData, member);
            } else {
              if (fetchedMember.roles.has(role.id)) { // eslint-disable-line
                const removeRole = await fetchedMember.roles.remove(role, "Timed mute has expired.").catch(e => ({
                  "error": e
                }));

                if (removeRole.error) continue;

                try {
                  removeFromDatabase(clientData, member);
                } catch (error) {
                  continue;
                }
              } else continue;
            }
          } else {
            removeFromDatabase(clientData, member);
          }
        }
      }
    }
  }, 5000);

  function removeFromDatabase(clientData, member) {
    const index = clientData.mutedMembers.findIndex(el => el.memberId === member.memberId);

    if (index > -1) {
      clientData.mutedMembers.splice(index, 1);
      return updateDatabase(clientData.mutedMembers);
    }
  }

  async function updateDatabase(mutedMembers) {
    try {
      await client.db.update({ "mutedMembers": mutedMembers });
    } catch (error) {
      // Ignore all errors as it can try again in the next interval.
    }
  }
};