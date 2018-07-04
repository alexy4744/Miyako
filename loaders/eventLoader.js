module.exports = (client, fs) => {
  /* Load all client events. */
  fs.readdir("./events").then(events => {
    if (events.length < 1) throw new Error("No events found");
    events.map(e => client.events.set(e.slice(0, -3), require(`../events/${e}`)));
  }).catch(error => {
    console.error(error);
  });
};