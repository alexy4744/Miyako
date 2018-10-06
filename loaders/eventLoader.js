module.exports = (client, fs) => {
  /* Load all client events. */
  fs.readdir("./events")
    .then(events => {
      if (events.length < 1) throw new Error("No events found");
      events.forEach(e => client.events[e.slice(0, -3)] = require(`../events/${e}`));
    }).catch(error => {
      throw error;
    });
};