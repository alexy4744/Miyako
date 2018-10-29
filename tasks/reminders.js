const Task = require("../modules/Base/Task");

module.exports = class Reminders extends Task {
  constructor(...args) {
    super(...args, {
      interval: 1000
    });
  }

  async run() {
    if (!this.client.cache || !this.client.cache.reminders || this.client.cache.reminders.length < 1) return;

    for (const reminder of this.client.cache.reminders) {
      if (Date.now() >= reminder.when) {
        try {
          const clientData = this.client.cache;
          const user = await this.client.users.fetch(reminder.id);
          await user.send(reminder.reminder);
          const index = clientData.reminders.findIndex(r => r.content === reminder.content && r.id === reminder.id);

          clientData.reminders.splice(index, 1);

          await this.client.updateDatabase(clientData);
        } catch (error) {
          // noop
        }
      }
    }
  }
};