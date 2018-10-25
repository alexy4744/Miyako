module.exports = async (client, fs) => {
  const monitors = await fs.readdir("./monitors").catch(error => ({ error }));
  if (monitors.error) throw monitors.error;
  if (monitors.length < 1) return;

  for (let monitor of monitors) {
    monitor = monitor.slice(0, -3).toLowerCase();
    client.monitors[monitor] = new (require(`../monitors/${monitor}`))(client);
    client.monitors[monitor].name = monitor.charAt(0).toUpperCase() + monitor.slice(1);
  }
};