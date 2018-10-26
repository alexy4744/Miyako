const Loader = require("../modules/Base/Loader");

module.exports = class TaskLoader extends Loader {
  constructor(...args) {
    super(...args);
  }

  async run() {
    const tasks = await this.fs.readdir("./tasks").catch(error => { throw error; });
    tasks.forEach(t => this.client.tasks[t.slice(0, -3)] = require(`../tasks/${t}`)(this.client));
  }
};