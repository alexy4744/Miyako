module.exports = class Monitor {
  constructor(client, options = {}) {
    this.client = client;
    this.name = options.name || null;
    this.ignoreSelf = options.ignoreSelf || true;
    this.ignoreBots = options.ignoreBots || true;
    this.ignoreOthers = options.ignoreOthers || false;
  }

  reload() {
    delete require.cache[require.resolve(`../../monitors/${this.name}`)];
    delete this.client.monitors[this.name];

    this.client.monitors[this.name] = require(`../../monitors/${this.name}`);
  }
};