module.exports = class Task {
  constructor(client, options = {}) {
    this.client = client;
    this.interval = options.interval || 1000;
  }

  start() {
    this.client.setInterval(() => this.run(), this.interval);
  }
};