// Sources
// https://jenssegers.com/61/perceptual-image-hashes
// https://www.hackerfactor.com/blog/?/archives/432-Looks-Like-It.html

const hammingDistance = require("../utils/hammingDistance");
const snekfetch = require("snekfetch");
const { createCanvas, Image } = require("canvas");
const canvas = createCanvas(8, 8);
const ctx = canvas.getContext("2d");

module.exports = class ImageFilter {
  constructor() {
    this.image = new Image();
    this.hash = null;
  }

  loadImage(src) {
    return new Promise(async (resolve, reject) => {
      let buffer = await snekfetch.get(src).catch(e => ({ "error": e }));
      if (buffer.error) return reject(buffer.error);
      if (!buffer.headers["content-type"].match(/image\//)) return reject(new Error("The source did not return an image."));

      buffer = buffer.body;
      if (!(buffer instanceof Buffer)) return reject(new Error("The image source did not return a buffer!"));

      this.image.src = src;
      this.image.onerror = error => reject(error);
      this.image.onload = () => {
        this.resize();
        this.greyscale();
        this.generateHash();

        return resolve({
          "image": this.image,
          "hash": this.hash
        });
      };
    });
  }

  resize() {
    ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, canvas.width, canvas.height);
    return this.image;
  }

  greyscale() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colors = imageData.data;
    const greyScaleFormula = (r, g, b) => { // http://entropymine.com/imageworsener/grayscale/
      const red = 0.2126 * (r ** 2.2);
      const green = 0.7152 * (g ** 2.2);
      const blue = 0.0722 * (b ** 2.2);

      return Math.pow(red + green + blue, 1 / 2.2);
    };

    for (let i = 0; i < colors.length; i += 4) {
      // Every 4 elements of the array is a pixel because its sorted as r, g, b, a
      const greyscaled = greyScaleFormula(colors[i], colors[i + 1], colors[i + 2]);

      // Make the red, green and blue of this pixel to be the same color so that it is "greyscaled"
      colors[i] = greyscaled; // Red
      colors[i + 1] = greyscaled; // Green
      colors[i + 2] = greyscaled; // Blue
      // Alpha channel remains the same value
    }

    ctx.putImageData(imageData, 0, 0);

    return imageData;
  }

  generateHash() {
    let hash = "";

    // Get the mean color
    const colors = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const meanColor = colors.reduce((a, b) => a + b) / colors.length; // Add up all the elements in the array and divide it by the length to find the average

    for (let i = 0; i < colors.length; i += 4) {
      if (colors[i - 2] > meanColor) hash += "1";
      else hash += "0";
    }

    this.hash = hash;
    return hash;
  }

  matchArray(hashArray, sensitivity) {
    if (!this.image || !this.hash) return Promise.reject(new Error("Run loadImage() first"));
    if (!hashArray) return Promise.reject(new Error("Hash array must be provided"));

    let currentDistance = 1;

    // Find a hash that is most similar to the hash of this image
    for (const currentHash of hashArray) {
      if (currentHash.length !== 64 || isNaN(currentHash)) continue;

      if (this.hash === currentHash) {
        currentDistance = 0;
        break;
      }

      const distance = hammingDistance(this.hash, currentHash);
      if (distance < currentDistance) currentDistance = distance;
    }

    sensitivity = sensitivity || 0.078125;

    // If the most similar hash is less than 7% in differences (about 5 different bits), then it is similar enough to be resolved as true.
    if (currentDistance <= sensitivity) return Promise.resolve(true);
    else return Promise.resolve(false); // eslint-disable-line
  }
};