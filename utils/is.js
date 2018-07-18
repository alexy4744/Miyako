module.exports = {
  array: input => (input instanceof Array),
  // https://github.com/dirigeants/klasa/blob/master/src/lib/util/util.js
  function: input => typeof input === "function",
  thenable: input => (input instanceof Promise) || (Boolean(input) && module.exports.function(input.then) && module.exports.function(input.catch))
};