const fs = require("fs-nextra");

module.exports = class Loader {
  constructor(client, options = {}) {
    this.client = client;
    this.fs = fs;
    this.options = options;
  }

  async loadAll() {
    const loaders = await this.fs.readdir("./loaders").catch(error => ({ error }));
    if (loaders.error) return Promise.reject(loaders.error);

    for (const loader of loaders) new (require(`../../loaders/${loader}`))(this.client).run();
  }
};