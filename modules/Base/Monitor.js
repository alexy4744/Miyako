module.exports = class Monitor {
  constructor(client, options = {}) {
    this.client = client;
    this.name = options.name || null;
    this.ignoreSelf = options.ignoreSelf || true;
    this.ignoreBots = options.ignoreBots || true;
    this.ignoreOthers = options.ignoreOthers || false;
    this.ignoreEdits = options.ignoreEdits || false;
  }

  shouldIgnore(msg) {
    if (msg.author.id === this.client.user.id && this.ignoreSelf) return 1;
    if (msg.author.bot && this.ignoreBots) return 1;
    if (this.ignoreOthers) return 1;
    if (this.ignoreEdits && msg.edits.length > 0) return 1;

    return 0;
  }

  reload() {
    delete require.cache[require.resolve(`../../monitors/${this.name}`)];
    delete this.client.monitors[this.name];

    this.client.monitors[this.name] = require(`../../monitors/${this.name}`);
  }
};