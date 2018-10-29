module.exports = class Monitor {
  constructor(client, options = {}) {
    this.client = client;
    this.ignoreSelf = options.ignoreSelf || true;
    this.ignoreBots = options.ignoreBots || true;
    this.ignoreOthers = options.ignoreOthers || false;
  }
};