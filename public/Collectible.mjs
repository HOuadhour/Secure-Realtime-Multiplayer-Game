class Collectible {
  constructor({ x, y, value, id }) {
    this.id = id;
    this.value = value;
    this.x = x;
    this.y = y;
    this.w = 30;
    this.h = 30;
  }

  draw(context, coins) {
    context.drawImage(coins[this.value], this.x, this.y);
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch (e) {}

export default Collectible;
