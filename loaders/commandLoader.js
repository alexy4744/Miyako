const Loader = require("../modules/Base/Loader");
const fs = require("fs-nextra");

module.exports = class CommandLoader extends Loader {
  constructor(...args) {
    super(...args);
  }

  async run() {
    const folders = await fs.readdir("./commands").catch(error => ({ error }));
    if (folders.error) throw folders.error;
    if (folders.length < 1) return;

    for (const folder of folders) {
      this.client.categories.add(folder);

      const commands = await fs.readdir(`./commands/${folder}`).catch(error => ({ error }));
      if (commands.error) throw commands.error;

      for (const command of commands) {
        if (command.split(".").pop() === "js") {
          const cmd = new (require(`../commands/${folder}/${command}`))(this.client);
          const name = command.slice(0, -3).toLowerCase();

          cmd.name = name;
          cmd.category = folder;

          this.client.commands[name] = cmd;

          for (const alias of cmd.aliases) this.client.aliases[alias] = name;
        }
      }
    }
  }
};