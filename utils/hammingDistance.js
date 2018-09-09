module.exports = (x, y) => {
  // Higher the hamming distance, the less similar it is.
  if (x.length !== y.length) return 1;
  if (x === y) return 0;

  let difference = 0;

  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) difference++; // Check if this bit on the first hash is different from the second hash

  return difference / x.length; // Return it as a percentage
};