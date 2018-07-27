/* eslint no-confusing-arrow: 0 */
module.exports = {
  array: input => (input instanceof Array),
  object: input => (input.constructor === Object),
  function: input => typeof input === "function",
  thenable: input => (input instanceof Promise) || (Boolean(input) && module.exports.function(input.then) && module.exports.function(input.catch)),
  odd: input => input % 2 === 1 ? true : false
};