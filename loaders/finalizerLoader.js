const Loader = require("../modules/Base/Loader");

module.exports = class FinalizerLoader extends Loader {
  constructor(...args) {
    super(...args);
  }

  async run() {
    const finalizers = await this.fs.readdir("./finalizers").catch(error => ({ error }));
    if (finalizers.error) throw finalizers.error;
    if (finalizers.length < 1) return;

    for (let finalizer of finalizers) {
      finalizer = finalizer.slice(0, -3).toLowerCase();
      this.client.finalizers[finalizer] = new (require(`../finalizers/${finalizer}`))(this.client);
      this.client.finalizers[finalizer].name = finalizer.charAt(0).toUpperCase() + finalizer.slice(1);
    }
  }
};