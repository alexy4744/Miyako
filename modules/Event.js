module.exports = class Event {
  constructor(client, options = {}) {
    this.client = client;
    this.options = options;
  }
};