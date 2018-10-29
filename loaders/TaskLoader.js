const Loader = require("../modules/Base/Loader");

module.exports = class TaskLoader extends Loader {
  constructor(...args) {
    super(...args);
  }

  async run() {
    const tasks = await this.fs.readdir("./tasks").catch(error => ({ error }));
    if (tasks.error) throw tasks.error;
    if (tasks.length < 1) return;

    for (let task of tasks) {
      task = task.slice(0, -3).toLowerCase();
      this.client.tasks[task] = new (require(`../tasks/${task}`))(this.client);
      this.client.tasks[task].name = task.charAt(0).toUpperCase() + task.slice(1);
      this.client.tasks[task].start();
    }
  }
};