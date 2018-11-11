const Loader = require("../modules/Base/Loader");
const fs = require("fs-nextra");

module.exports = class TaskLoader extends Loader {
  constructor(...args) {
    super(...args);
  }

  async run() {
    const utils = await fs.readdir("./utils").catch(error => { throw error; });
    utils.forEach(u => this.client.utils[u.slice(0, -3)] = require(`../utils/${u}`));
  }
};