module.exports = (client, fs) => {
  fs.readdir("./tasks")
    .then(tasks => tasks.forEach(t => client.tasks[t.slice(0, -3)] = require(`../tasks/${t}`)(client)))
    .catch(error => { throw error; });
};