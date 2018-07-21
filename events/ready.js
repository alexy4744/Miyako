const { yt, twitch } = require("../config.json");
const LePlayer = require("LePlayer");
const chalk = require("chalk");
const figlet = require("figlet");

module.exports = client => {
  client.LePlayer = new LePlayer(client, { // Initialze LePlayer in the ready event to get the bot's user id.
    port: 6969,
    cleanUpOnClose: true,
    ytAPIkey: yt,
    twitchAPIkey: twitch
  });

  client.LePlayer.on("error", error => console.error(error));

  client.LePlayer.on("finished", guild => {
    if (!guild.looped) guild.queue.shift();
    if (guild.queue.length > 0) client.LePlayer.play(guild.guildId, guild.queue[0].track); // eslint-disable-line
    else client.LePlayer.stop(guild.guildId);
  });

  setInterval(async () => {
    if (client.cache && client.cache.bannedMembers) {
      for (const member of client.cache.bannedMembers) {
        if (!member.bannedUntil) continue; // If there is no date
        if (Date.now() >= member.bannedUntil) { // If the current date is already passed the specified ban duration, unban this member.
          if (client.guilds.has(member.guildId)) { // If the bot is still in the guild the member that was originally banned in.
            const fetchedUser = await client.users.fetch(member.memberId).catch(e => ({
              "error": e
            }));

            if (fetchedUser.error) {
              // If this user does not exist in Discord anymore, remove it from the database.
              if (fetchedUser.error.message === "Unknown User") {
                const clientData = await client.db.get().catch(() => ({
                  "error": ":("
                }));

                if (clientData.error) continue; // If it errors, skip this iteration and try to remove it again in the next interval.

                const index = clientData.bannedMembers.findIndex(el => el.memberId === member.memberId);

                if (index > -1) {
                  clientData.bannedMembers.splice(index, 1);
                  client.db.update({
                    "bannedMembers": clientData.bannedMembers
                  }).then(() => client.updateCache("bannedMembers", clientData.bannedMembers).catch(() => { }))
                    .catch(() => { });
                }
              }

              continue;
            } else {
              try {
                await client.guilds.get(member.guildId).members.unban(fetchedUser);
              } catch (error) {
                // If it fails to unban this member, put this member back into the database, so that it can try unbanning this member again in the next interval.
                const clientData = await client.db.get().catch(() => ({
                  "error": ":("
                }));

                if (clientData.error) continue;
                if (clientData.bannedMembers.findIndex(el => el.memberId === member.memberId) < 0) {
                  try {
                    clientData.bannedMembers.push(member);
                    await client.db.update({
                      "bannedMembers": clientData.bannedMembers
                    });
                    await client.updateCache("bannedMembers", clientData.bannedMembers);
                  } catch (err) {
                    continue;
                  }
                }

                continue;
              }
            }
          } else continue; // eslint-disable-line
        }
      }
    }
  }, 5000);

  const readyMessage = [
    `✔  ${client.events.size} events ${chalk.green("loaded!")}`,
    `✔  ${client.inhibitors.size} inhibitors ${chalk.green("loaded!")}`,
    `✔  ${client.commands.size} commands ${chalk.green("loaded!")}`,
    `✔  ${client.aliases.size} command aliases ${chalk.green("loaded!")}`,
    `${client.LePlayer ? `🥙  LePlayer has been ${chalk.green("initialized!")}` : ``}`,
    `⏱  All loaded in ${((Date.now() - client.readyAt) / 1000).toFixed(2) > 1 ? chalk.red(((Date.now() - client.readyAt) / 1000).toFixed(2)) : chalk.green(((Date.now() - client.readyAt) / 1000).toFixed(2))} seconds!`,
    `🚀  ${client.user.tag} is ${chalk.green("ready!")} Serving for ${client.guilds.size} guilds and ${client.users.size} users!`
  ];

  return figlet.text(client.user.username, {
    font: "Alpha"
  }, (err, art) => {
    if (err) return;
    console.log(chalk.keyword("cyan")(art));
    readyMessage.forEach(msg => console.log(`${chalk.green(`[${new Date(Date.now()).toLocaleString()}]`)} ${chalk.keyword("cyan")(msg)}`));
  });
};
