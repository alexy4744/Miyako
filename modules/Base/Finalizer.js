module.exports = class Finalizer {
  constructor(client, options = {}) {
    this.client = client;
    this.options = options;
  }
};