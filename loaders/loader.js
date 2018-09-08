const fs = require("fs-nextra");

module.exports = client => {
  require("./commandLoader")(client, fs);
  require("./databaseLoader")(client);
  require("./eventLoader")(client, fs);
  require("./finalizerLoader")(client, fs);
  require("./inhibitorLoader")(client, fs);
  require("./monitorLoader")(client, fs);
  require("./tasksLoader")(client, fs);
  require("./utilitiesLoader")(client, fs);
};