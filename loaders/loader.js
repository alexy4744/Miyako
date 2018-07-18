const fs = require("fs-nextra");

module.exports = client => {
  require("./commandLoader")(client, fs);
  require("./databaseLoader")(client, fs);
  require("./eventLoader")(client, fs);
  require("./monitorLoader")(client, fs);
  require("./inhibitorLoader")(client, fs);
  require("./utilitiesLoader")(client, fs);
  return null;
};