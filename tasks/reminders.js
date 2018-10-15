module.exports = client => {
  client.setInterval(async () => {
    if (!client.myCache || !client.myCache.reminders || client.myCache.reminders.length < 1) return;

    for (const reminder of client.myCache.reminders) {
      if (Date.now() >= reminder.when) {
        try {
          const user = await client.users.fetch(reminder.id);
          await user.send(reminder.reminder);
          const index = client.myCache.reminders.findIndex(r => r.content === reminder.content && r.id === reminder.id);
          const reminders = client.myCache.reminders.splice(index, 1);
          client.myCache = {
            ...client.myCache,
            reminders
          };
          await client.db.update("client", client.myCache);
        } catch (error) {
          // noop
        }
      }
    }
  }, 500);
};