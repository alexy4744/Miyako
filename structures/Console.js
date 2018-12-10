const { colors } = require("./Constants");
const { Console } = require("console");
const chalk = require("chalk");

class MiyakoConsole extends Console {
  constructor(...args) {
    super(process.stdout, process.stderr, ...args);
    this.colors = colors;
  }

  get date() {
    const now = new Date(Date.now());
    return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  }

  prettyDate(type) {
    return chalk.hex(colors[type])(`[${this.date}]`);
  }

  error(error) {
    return super.error(this.prettyDate("error"), error);
  }

  log(data) {
    return super.log(this.prettyDate("default"), data);
  }

  warn(data) {
    return super.warn(this.prettyDate("warn"), data);
  }
}

module.exports = MiyakoConsole;