const Void = require("./structures/Client");
const { token, owner, prefix, yt, twitch } = require("./config.json");
const { LePlayer } = require("LePlayer");
const client = new Void({
  owner: owner,
  prefix: prefix
});

client.on("ready", () => {
  client.LePlayer = new LePlayer(client, { // Initialze LePlayer in the ready event to get the bot's user id.
    port: 6969,
    cleanUpOnClose: true,
    ytAPIkey: yt,
    twitchAPIkey: twitch
  });

  client.LePlayer.on("error", error => console.log(error));

  client.LePlayer.on("finished", guild => { // .on will cause memory leaks as it adds a new listener everytime the play command is ran.
    if (!guild.looped) guild.queue.shift();
    if (guild.queue.length > 0) client.LePlayer.play(guild.guildId, guild.queue[0].track); // eslint-disable-line
    else {
      client.LePlayer.stop(guild.guildId).then(g => {
        g.queue = [];
        g.updates = {};
        g.playing = false;
        g.paused = false;
      });
    }
  });

  console.log(client.aliases);
  console.log(client.commands);
  console.log(client.inhibitors);
});

client.on("error", error => client.events.get("error")(error));
client.on("message", msg => client.events.get("message")(client, msg));

client.login(token);