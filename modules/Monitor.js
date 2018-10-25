module.exports = class Monitor {
  constructor(client, options = {}) {
    this.client = client;
    this.options = options;
    this.name = options.name || this.constructor.name;
  }
};