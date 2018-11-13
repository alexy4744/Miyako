const Command = require("../../modules/Base/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: () => `Reload commands, events, inhibitors, finalizers, monitors, tasks`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  run(msg, args) {
    if (!args[0]) return msg.fail("You must supply a command/event/inhibitor/finalizer/monitor/task to reload!");

    const thingToReload = args[0];

    if (this.client.commands[thingToReload] || this.client.aliases[thingToReload]) this.client.commands[thingToReload].reload();
    else if (this.client.events[thingToReload]) this.client.events[thingToReload].reload();
    else if (this.client.inhibitors[thingToReload]) this.client.inhibitors[thingToReload].reload();
    else if (this.client.finalizers[thingToReload]) this.client.finalizers[thingToReload].reload();
    else if (this.client.monitors[thingToReload]) this.client.monitors[thingToReload].reload();
    else if (this.client.tasks[thingToReload]) this.client.tasks[thingToReload].reload();

    return msg.success(`"${thingToReload}" has been succesfully reloaded!`);
  }
};