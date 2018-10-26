module.exports = class Monitor {
  constructor(client, options = {}) {
    this.client = client;
    this.options = options;
  }
};