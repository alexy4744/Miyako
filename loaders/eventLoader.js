const Loader = require("../modules/Base/Loader");
const fs = require("fs-nextra");

module.exports = class EventLoader extends Loader {
  constructor(...args) {
    super(...args);
  }

  async run() {
    const events = await fs.readdir("./events").catch(error => ({ error }));
    if (events.error) throw events.error;
    if (events.length < 1) throw new Error("No events found!");

    for (let event of events) {
      event = event.slice(0, -3).toLowerCase();
      this.client.events[event] = new (require(`../events/${event}`))(this.client);
      this.client.events[event].name = event.charAt(0).toUpperCase() + event.slice(1);
      this.client.on(event, (...args) => this.client.events[event].run(...args));
    }
  }
};