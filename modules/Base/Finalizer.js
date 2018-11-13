module.exports = class Finalizer {
  constructor(client, options = {}) {
    this.client = client;
    this.name = options.name || null;
  }

  reload() {
    delete require.cache[require.resolve(`../../finalizers/${this.name}`)];
    delete this.client.finalizers[this.name];

    this.client.finalizers[this.name] = require(`../../finalizers/${this.name}`);
  }
};