const Loader = require("../modules/Base/Loader");

module.exports = class InhibitorLoader extends Loader {
  constructor(...args) {
    super(...args);
  }

  async run() {
    const inhibitors = await this.fs.readdir("./inhibitors").catch(error => ({ error }));
    if (inhibitors.error) throw inhibitors.error;
    if (inhibitors.length < 1) return;

    for (let inhibitor of inhibitors) {
      inhibitor = inhibitor.slice(0, -3).toLowerCase();
      this.client.inhibitors[inhibitor] = new (require(`../inhibitors/${inhibitor}`))(this.client);
      this.client.inhibitors[inhibitor].name = inhibitor.charAt(0).toUpperCase() + inhibitor.slice(1);
    }
  }
};