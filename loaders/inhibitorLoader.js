module.exports = async (client, fs) => {
  const inhibitors = await fs.readdir("./inhibitors").catch(error => ({ error }));
  if (inhibitors.error) throw inhibitors.error;
  if (inhibitors.length < 1) return;

  for (let inhibitor of inhibitors) {
    inhibitor = inhibitor.slice(0, -3).toLowerCase();
    client.inhibitors[inhibitor] = new (require(`../inhibitors/${inhibitor}`))(client);
    client.inhibitors[inhibitor].name = inhibitor.charAt(0).toUpperCase() + inhibitor.slice(1);
  }
};