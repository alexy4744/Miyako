module.exports = (client, fs) => {
  /* Load all commands and aliases. */
  fs.readdir("./monitors").then(monitors => {
    monitors.forEach(m => client.monitors.set(m.slice(0, -3), require(`../monitors/${m}`)));
  }).catch(error => {
    console.error(error);
  });
};