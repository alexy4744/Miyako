module.exports = (client, fs) => {
  /* Load all commands and aliases. */
  fs.readdir("./commands").then(folders => {
    folders.forEach(folder => fs.readdir(`./commands/${folder}`)
      .then(commands => commands.forEach(c => client.commands.set(c.slice(0, -3).toLowerCase(), require(`../commands/${folder}/${c}`))))
      .catch(error => console.error(error)));
  }).catch(error => console.error(error));
};