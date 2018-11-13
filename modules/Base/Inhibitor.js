module.exports = class Inhibitor {
  constructor(client, options = {}) {
    this.client = client;
    this.name = options.name || null;
  }

  reload() {
    delete require.cache[require.resolve(`../../inhibitors/${this.name}`)];
    delete this.client.inhibitors[this.name];

    this.client.inhibitors[this.name] = require(`../../inhibitors/${this.name}`);
  }
};