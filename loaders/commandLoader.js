module.exports = (client, fs) => {
  /* Load all commands and aliases. */
  fs.readdir("./commands").then(folders => {
    folders.forEach(folder => {
      fs.readdir(`./commands/${folder}`).then(commands => {
        commands.forEach(c => {
          const Command = new (require(`../commands/${folder}/${c}`))(client);
          if (!Command.options.name) Command.options.name = c.slice(0, -3);
          Command.options.category = folder;
          client.commands.set(c.slice(0, -3).toLowerCase(), Command);

          if (Command.options.aliases && Command.options.aliases.length > 0) { // Check if there are aliases for this command.
            for (const alias of Command.options.aliases) client.aliases.set(alias.toLowerCase(), Command);
          }
        });
      }).catch(error => {
        console.error(error);
      });
    });
  }).catch(error => {
    console.error(error);
  });
};