module.exports = (client, fs) => {
  /* Load all available modules. */
  fs.readdir("./modules")
    .then(modules => modules.forEach(m => client.modules.set(m.slice(0, -3), require(`../modules/${m}`))))
    .catch(error => console.error(error));
};