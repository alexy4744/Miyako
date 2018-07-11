module.exports = (client, fs) => {
  /* Load all commands and aliases. */
  fs.readdir("./commands").then(folders => {
    folders.forEach(folder => {
      client.categories.add(folder);

      fs.readdir(`./commands/${folder}`).then(commands => {
        commands.forEach(c => {
          const cmd = require(`../commands/${folder}/${c}`);
          if (!cmd.options) console.error(`${c} must export an object called "options" module.exports.options = {}`); // eslint-disable-line
          else if (!cmd.run) console.error(`${c} must export a function called "run" module.exports.run = () => {}`); // eslint-disable-line
          else {
            if (!cmd.options.name) cmd.options.name = c.slice(0, -3);
            cmd.options.category = folder;
            client.commands.set(c.slice(0, -3).toLowerCase(), cmd);

            if (cmd.options.aliases && cmd.options.aliases.length > 0) { // Check if there are aliases for this command.
              for (const alias of cmd.options.aliases) client.aliases.set(alias.toLowerCase(), cmd);
            }
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