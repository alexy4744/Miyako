module.exports = (sX, sY) => {
  // Higher the hamming distance, the less similar it is.
  if (sX.length !== sY.length) return 1;
  if (sX === sY) return 0;

  let difference = 0;

  for (let i = 0; i < sX.length; i++) {
    if (sX[i] !== sY[i]) difference++;
  }

  return difference / sX.length; // Return it as a percentage
};