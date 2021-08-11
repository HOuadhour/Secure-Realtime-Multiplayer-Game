import coords from "./Canvas.mjs";

class Player {
  constructor({ x, y, score, id }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.w = 65;
    this.h = 85;
    this.dx = 0;
    this.dy = 0;
    this.step = 7;
  }

  movePlayer(dir, speed) {
    if (dir === "left") this.x -= speed;
    if (dir === "right") this.x += speed;
    if (dir === "up") this.y -= speed;
    if (dir === "down") this.y += speed;
  }

  collision(item) {
    if (this.x < item.x + item.w && this.x + this.w > item.x && this.y < item.y + item.h && this.y + this.h > item.y) {
      return true;
    }
    return false;
  }

  calculateRank(arr) {
    const scores = arr.sort((a, b) => b.score - a.score);
    if (this.score === 0) {
      return `Rank: ${arr.length} / ${arr.length}`;
    }
    return `Rank: ${scores.findIndex(player => player.id === this.id) + 1} / ${arr.length}`;
  }
}

export default Player;
