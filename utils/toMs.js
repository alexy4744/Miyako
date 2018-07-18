module.exports = string => {
  const units = [];
  const time = [];

  for (const char of string) {
    if (!isNaN(char)) time.push(char); // if it is a number
    else units.push(char); // if its a letter
  }
};