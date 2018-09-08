module.exports = (client, fs) => {
  /* Load all message monitors */
  fs.readdir(`./monitors`)
    .then(monitors => monitors.forEach(m => client.monitors[m.slice(0, -3)] = require(`../monitors/${m}`)))
    .catch(error => console.error(error));
};