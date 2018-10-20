module.exports = client => {
  client.setInterval(async () => {
    if (!client.myCache || !client.myCache.reminders || client.myCache.reminders.length < 1) return;

    for (const reminder of client.myCache.reminders) {
      if (Date.now() >= reminder.when) {
        try {
          const clientData = client.myCache;
          const user = await client.users.fetch(reminder.id);
          await user.send(reminder.reminder);
          const index = clientData.reminders.findIndex(r => r.content === reminder.content && r.id === reminder.id);

          clientData.reminders.splice(index, 1);

          await client.db.update("client", clientData);
        } catch (error) {
          // noop
        }
      }
    }
  }, 1000);
};