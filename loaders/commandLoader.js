module.exports = async (client, fs) => {
  const folders = await fs.readdir("./commands").catch(error => ({ error }));
  if (folders.error) throw folders.error;
  if (folders.length < 1) return;

  for (const folder of folders) {
    client.categories.add(folder);

    const commands = await fs.readdir(`./commands/${folder}`).catch(error => ({ error }));
    if (commands.error) throw commands.error;

    for (const command of commands) {
      if (command.split(".").pop() === "js") {
        const cmd = new (require(`../commands/${folder}/${command}`))(client);
        const name = command.slice(0, -3).toLowerCase();

        cmd.options.name = name;
        cmd.options.category = folder;

        client.commands[name] = cmd;

        for (const alias of cmd.options.aliases) client.aliases[alias] = name;
      }
    }
  }
};