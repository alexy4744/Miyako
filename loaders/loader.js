const fs = require("fs-nextra");

module.exports = client => {
  require("./commandLoader")(client, fs);
  require("./databaseLoader")(client);
  require("./eventLoader")(client, fs);
  require("./finalizerLoader")(client, fs);
  require("./inhibitorLoader")(client, fs);
  require("./moduleLoader")(client, fs);
  require("./tasksLoader")(client, fs);
  require("./utilitiesLoader")(client, fs);
};