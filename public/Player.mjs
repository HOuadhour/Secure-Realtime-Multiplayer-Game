import { getRandomInt } from "./utils.mjs";
import coords from "./Canvas.mjs";

const canvas = coords.canvas;
const margin = coords.margin;
const playField = coords.playField;

class Player {
  constructor({ x, y, score, id }) {
    this.w = 65;
    this.h = 85;
    this.x = x || getRandomInt(margin, canvas.width - margin - this.w);
    this.y = y || getRandomInt(margin * 4, canvas.height - margin - this.h);
    this.score = score;
    this.id = id;
    this.step = 6;
    this.directions = {};
  }

  drawPlayers(context, avatars, socket, players) {
    const mouvements = Object.keys(this.directions).filter(dir => this.directions[dir]);
    mouvements.forEach(direction => {
      this.movePlayer(direction, this.step);
    });

    if (socket.id === this.id) {
      context.fillStyle = "white";
      context.textAlign = "right";
      context.fillText(this.calculateRank(players), canvas.width - margin, margin);
      context.drawImage(avatars[0], this.x, this.y);
    } else context.drawImage(avatars[1], this.x, this.y);
  }

  startMoving(dir) {
    this.directions[dir] = true;
  }

  stopMoving(dir) {
    this.directions[dir] = false;
  }

  movePlayer(dir, speed) {
    if (dir === "left") {
      if (this.x - speed >= playField.left) {
        this.x -= speed;
      } else {
        this.x = playField.left;
      }
    }
    if (dir === "right") {
      if (this.x + this.w + speed <= playField.right) {
        this.x += speed;
      } else {
        this.x = playField.right - this.w;
      }
    }
    if (dir === "up") {
      if (this.y - speed >= playField.top) {
        this.y -= speed;
      } else {
        this.y = playField.top;
      }
    }
    if (dir === "down") {
      if (this.y + this.h + speed <= playField.bottom) {
        this.y += speed;
      } else {
        this.y = playField.bottom - this.h;
      }
    }
  }

  collision(item) {
    if (this.x < item.x + item.w && this.x + this.w > item.x && this.y < item.y + item.h && this.y + this.h > item.y) {
      return true;
    }
    return false;
  }

  calculateRank(players) {
    const scores = players.sort((a, b) => b.score - a.score);
    if (this.score === 0) {
      return `Rank: ${players.length} / ${players.length}`;
    }
    return `Rank: ${scores.findIndex(player => player.id === this.id) + 1} / ${players.length}`;
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Player;
} catch (e) {}

export default Player;
