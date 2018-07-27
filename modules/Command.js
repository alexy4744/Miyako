module.exports = class Command {
  constructor(client, options = {}) {
    this.client = client;
    this.options = options;
  }
};