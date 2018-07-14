module.exports = (client, fs) => {
  /* Load all command inhibitors. */
  fs.readdir("./inhibitors").then(inhibitors => {
    inhibitors.forEach(i => client.inhibitors.set(i.slice(0, -3), require(`../inhibitors/${i}`)));
  }).catch(error => {
    console.error(error);
  });
};