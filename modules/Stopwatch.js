// Based off of https://github.com/dirigeants/klasa/blob/master/src/lib/util/Stopwatch.js

const { performance } = require("perf_hooks");

module.exports = class Stopwatch {
  constructor(digits = 2) {
    this.start = performance.now();
    this.end = null;
    this.digits = digits;
  }

  get duration() {
    if (!this.end) return performance.now() - this.start;
    return this.end - this.start;
  }

  stop() {
    if (!this.end) this.end = performance.now();
    return this;
  }

  restart() {
    this.start = performance.now();
    this.end = null;
    return this;
  }

  toString(duration) {
		const time = duration || this.duration;
		if (time >= 1000) return `${(time / 1000).toFixed(this.digits)}s`;
		if (time >= 1) return `${time.toFixed(this.digits)}ms`;
		return `${(time * 1000).toFixed(this.digits)}μs`;
  }
};