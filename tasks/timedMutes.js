/* eslint no-use-before-define: 0 */
/* eslint curly: 0 */

module.exports = client => {
  client.setInterval(async () => { // Using setInterval from client so that if the client gets destroyed, it will stop the interval.
    if (client.cache && client.cache.mutedMembers) {
      for (const member of client.cache.mutedMembers) {
        if (!member.mutedUntil) continue; // If it is not a timed mute.
        if (Date.now() >= member.mutedUntil) { // If the current date is already passed the specified ban duration, unban this member.
          const clientData = await client.db.get().catch(() => ({
            "error": ":("
          }));

          if (clientData.error) continue; // If it errors, skip this iteration and try to unban again in the next interval.

          if (client.guilds.has(member.guildId) && client.guilds.get(member.guildId).roles.has(member.muteRoleId)) { // If the bot is still in the guild the member that was originally banned in.
            const guild = client.guilds.get(member.guildId);
            const role = guild.roles.get(member.muteRoleId);
            const fetchedMember = await guild.members.fetch(member.memberId).catch(e => ({
              "error": e
            }));

            if (fetchedMember.error) {
              // If this user does not exist in Discord anymore, remove it from the database.
              if (fetchedMember.error && fetchedMember.error.message === "Unknown User") removeFromDatabase(clientData, member);
              continue;
            } else {
              if (fetchedMember.roles.has(role.id)) { // eslint-disable-line
                try {
                  await fetchedMember.roles.remove(role, "Timed mute has expired."); // eslint-disable-line
                  removeFromDatabase(clientData, member);
                } catch (error) {
                  addToDatabase(clientData, member);
                  continue;
                }
              } else continue;
            }
          } else {
            removeFromDatabase(clientData, member);
            continue;
          }
        } else continue;
      }
    }
  }, 5000);

  // Move these functions to another file
  function removeFromDatabase(clientData, member) {
    const index = clientData.mutedMembers.findIndex(el => el.memberId === member.memberId);

    if (index > -1) {
      clientData.mutedMembers.splice(index, 1);
      return updateDatabase(clientData.mutedMembers);
    } else return null; // eslint-disable-line
  }

  function addToDatabase(clientData, member) {
    const index = clientData.mutedMembers.findIndex(el => el.memberId === member.memberId);

    if (index < 0) {
      clientData.mutedMembers.push(member);
      return updateDatabase(clientData.mutedMembers);
    } else return null; // eslint-disable-line
  }

  async function updateDatabase(mutedMembers) {
    try {
      await client.db.update({
        "mutedMembers": mutedMembers
      });
      await client.updateCache("mutedMembers", mutedMembers);
    } catch (error) {
      // Ignore all errors as it can try again in the next interval.
      return null;
    }
  }
};