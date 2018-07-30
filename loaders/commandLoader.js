module.exports = (client, fs) => {
  /* Load all commands and aliases. */
  fs.readdir("./commands").then(folders => {
    folders.forEach(folder => {
      client.categories.add(folder);
      fs.readdir(`./commands/${folder}`).then(commands => commands.forEach(c => {
        if (c.split(".").pop() === "js") {
          const cmd = new (require(`../commands/${folder}/${c}`))(client);
          client.commands[c.slice(0, -3)] = cmd;
          for (const alias of cmd.options.aliases) client.aliases[alias] = c.slice(0, -3);
        }
      })).catch(error => console.error(error));
    });
  }).catch(error => console.error(error));
};