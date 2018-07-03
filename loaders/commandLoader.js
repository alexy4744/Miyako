module.exports = (client, fs) => {
  /* Load all commands and aliases. */
  fs.readdir("./commands").then(folders => {
    folders.map(folder => {
      fs.readdir(`./commands/${folder}`).then(commands => {
        commands.map(c => {
          const cmd = require(`../commands/${folder}/${c}`);
          if (!cmd.options) console.error(`${c} must export an object called "options" module.exports.options = {}`); // eslint-disable-line
          else if (!cmd.run) console.error(`${c} must export a function called "run" module.exports.run = () => {}`); // eslint-disable-line
          else {
            if (!cmd.options.name) cmd.options.name = c.slice(0, -3);
            client.commands.set(c.slice(0, -3).toLowerCase(), {
              category: folder,
              command: cmd
            });
            if (cmd.options && (cmd.options.aliases || cmd.options.aliases.length > 0)) { // Check if there are aliases for this command.
              for (let i = 0, len = cmd.options.aliases.length; i < len; i++) {
                const cmdAlias = client.commands.get(c.slice(0, -3));
                cmdAlias.parentCommand = c.slice(0, -3);
                client.aliases.set(cmd.options.aliases[i].toLowerCase(), cmdAlias);
              }
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
}