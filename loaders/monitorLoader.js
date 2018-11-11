const Loader = require("../modules/Base/Loader");
const fs = require("fs-nextra");

module.exports = class MonitorLoader extends Loader {
  constructor(...args) {
    super(...args);
  }

  async run() {
    const monitors = await fs.readdir("./monitors").catch(error => ({ error }));
    if (monitors.error) throw monitors.error;
    if (monitors.length < 1) return;

    for (let monitor of monitors) {
      monitor = monitor.slice(0, -3).toLowerCase();
      this.client.monitors[monitor] = new (require(`../monitors/${monitor}`))(this.client);
      this.client.monitors[monitor].name = monitor.charAt(0).toUpperCase() + monitor.slice(1);
    }
  }
};