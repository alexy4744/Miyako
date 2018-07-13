module.exports = (sX, sY) => {
  /* Uses the Sørensen–Dice index algorithm to measure the similarity between two strings.
   * https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
   * Take the current letter and concatenate it with the letter before it accounting for whitespaces.
   * "Array" becomes ["Ar", "rr", "ra", "ay"]
   * "Object" becomes ["Ob", "bj", "je", "ec", "ct"]
   * "All right" becomes ["al", "ll", "l", "r", "ri", "ig", "gh", "ht"]
   */

  if (!sX || typeof sX !== "string") throw new Error("The first parameter must be a string!");
  if (!sY || typeof sY !== "string") throw new Error("The second parameter must be a string!");

  const sXBigrams = [];
  const sYBigrams = [];
  const matchingBigrams = [];

  // Remove any whitespace for the current pair of characters
  for (let x = 0; x < sX.length - 1; x++) sXBigrams.push(sX[x].replace(/\s/g, "") + sX[x + 1].replace(/\s/g, ""));
  for (let y = 0; y < sY.length - 1; y++) sYBigrams.push(sY[y].replace(/\s/g, "") + sY[y + 1].replace(/\s/g, ""));

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
    sXBigrams,
    sYBigrams,
    matchingBigrams,
    finalOutcome: (2 * matchingBigrams.length) / (sXBigrams.length + sYBigrams.length)
  };
};
