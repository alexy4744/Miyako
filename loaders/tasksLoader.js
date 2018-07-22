module.exports = (client, fs) => {
  fs.readdir("./tasks")
    .then(tasks => tasks.forEach(t => client.tasks.set(t.slice(0, -3), require(`../tasks/${t}`)(client))))
    .catch(e => console.error(e));
};