module.exports = async (client, fs) => {
  const events = await fs.readdir("./events").catch(error => ({ error }));
  if (events.error) throw events.error;
  if (events.length < 1) throw new Error("No events found!");

  for (let event of events) {
    event = event.slice(0, -3).toLowerCase();
    client.events[event] = new (require(`../events/${event}`))(client);
    client.events[event].name = event.charAt(0).toUpperCase() + event.slice(1);
    client.on(event, (...args) => client.events[event].run(...args));
  }
};