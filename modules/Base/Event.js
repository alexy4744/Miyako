module.exports = class Event {
  constructor(client, options = {}) {
    this.client = client;
    this.name = options.name || null;
  }

  reload() {
    this.client.off(this.name.toLowerCase());

    delete require.cache[require.resolve(`../../monitors/${this.name.toLowerCase()}`)];
    delete this.client.events[this.name];

    this.client.events[this.name] = require(`../../monitors/${this.name.toLowerCase()}`);
    this.client.on(this.name.toLowerCase(), (...args) => this.client.events[this.name.toLowerCase()].run(...args));
  }
};