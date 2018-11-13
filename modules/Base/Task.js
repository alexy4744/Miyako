module.exports = class Task {
  constructor(client, options = {}) {
    this.client = client;
    this.name = options.name || null;
    this.interval = options.interval || 1000;
    this.task = null;
  }

  start() {
    this.task = this.client.setInterval(() => this.run(), this.interval);
  }

  reload() {
    this.client.clearInterval(this.task);

    delete require.cache[require.resolve(`../../tasks/${this.name}`)];
    delete this.client.tasks[this.name];

    this.client.tasks[this.name] = new (require(`../../tasks/${this.name}`))(this.client);
    this.client.tasks[this.name].start();
  }
};