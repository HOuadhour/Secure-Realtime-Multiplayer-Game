import { getRandomInt } from "./utils.mjs";

const coords = {
  margin: 10,
  canvas: {
    width: 800,
    height: 600,
  },
  random: {
    avatar: {
      x: getRandomInt(10, 725),
      y: getRandomInt(40, 505),
      w: 65,
      h: 85,
    },
    coin: {
      x: getRandomInt(10, 760),
      y: getRandomInt(40, 560),
      w: 30,
      h: 30,
    },
  },
};

coords.playField = {
  x: coords.margin,
  y: coords.margin * 4,
  w: coords.canvas.width - coords.margin * 2,
  h: coords.canvas.height - coords.margin * 5,
  right: coords.canvas.width - coords.margin,
  left: coords.margin,
  top: coords.margin * 4,
  bottom: coords.canvas.height - coords.margin,
};

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = coords;
} catch (e) {}

export default coords;
