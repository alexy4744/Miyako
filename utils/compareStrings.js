module.exports = (sX, sY) => {
  /* Take the current letter and concatenate it with the letter before it
   * "Array" becomes ["Ar", "rr", "ra", "ay"]
   * "Object" becomes ["Ob", "bj", "je", "ec", "ct"]
   * "All right" becomes ["Al", "ll", "lr", "ri", "ig", "gh", "ht"]
   */

  const sXBigrams = [];
  const sYBigrams = [];
  const matchingBigrams = [];

  // If the current letter is a whitespace, remove it and concatenate it with the next letter
  for (let x = 0; x < sX.length - 1; x++) sXBigrams.push(sX[x].replace(/\s/g, "") + sX[x + 1]);
  for (let y = 0; y < sY.length - 1; y++) sYBigrams.push(sY[y].replace(/\s/g, "") + sY[y + 1]);

  // If both strings are the same length, it doesn't matter which length I should use.
  if (sXBigrams.length === sYBigrams.length) {
    for (let i = 0; i < sXBigrams.length; i++) {
      if (sXBigrams[i] === sYBigrams[i]) matchingBigrams.push(sXBigrams[i]); // Doesn't matter which bigram I push since both of them are the same.
    }
  } else if (sXBigrams.length > sYBigrams.length) {
    for (let j = 0; j < sXBigrams.length; j++) {
      for (let k = 0; k < sXBigrams.length; k++) {
        if (sXBigrams[j] === sYBigrams[k]) matchingBigrams.push(sXBigrams[j]);
      }
    }
  } else {
    for (let j = 0; j < sYBigrams.length; j++) {
      for (let k = 0; k < sYBigrams.length; k++) {
        if (sYBigrams[j] === sXBigrams[k]) matchingBigrams.push(sYBigrams[j]);
      }
    }
  }

  return {
    sXBigrams: sXBigrams,
    sYBigrams: sYBigrams,
    matchingBigrams: matchingBigrams,
    finalOutcome: (2 * matchingBigrams.length) / (sXBigrams.length + sYBigrams.length)
  };
};
