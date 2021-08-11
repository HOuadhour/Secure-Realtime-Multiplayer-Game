import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";
import coords from "./Canvas.mjs";
import {
  loadImages,
  clearCanvas,
  drawOutline,
  drawInfo,
  drawPlayers,
  movePlayer,
  getDirection,
  drawCoin,
  isEaten,
  drawEnd,
} from "./utils.mjs";
import { getRandomInt } from "./utils.mjs";

const socket = io();
const canvas = document.getElementById("game-window");
const context = canvas.getContext("2d");

canvas.width = coords.canvas.width;
canvas.height = coords.canvas.height;

const images = [
  "/public/images/main.png",
  "/public/images/other.png",
  "/public/images/coin1.png",
  "/public/images/coin2.png",
  "/public/images/coin3.png",
];
const imageObjects = loadImages(images);

let playersC = [];
let coinC;
let scoresC = {};
let gameEndedC = false;
let frame;

function start() {
  requestAnimationFrame(drawGame);
}

function drawGame() {
  if (!gameEndedC) {
    clearCanvas(context, canvas);
    drawInfo(context, canvas, coords, scoresC[socket.id], playersC.length, drawGame);
    drawOutline(context, coords.playField);
    drawPlayers(context, imageObjects, playersC, socket);
    drawCoin(context, imageObjects, coinC);
    const currentPlayer = playersC.findIndex(player => player.id === socket.id);
    if (currentPlayer !== -1) {
      const player = movePlayer(playersC[currentPlayer], coords.playField);
      playersC[currentPlayer] = player;
      if (player.dx || player.dy) {
        socket.emit("player-moved", playersC);
      }
    }
    if (isEaten(playersC[currentPlayer], coinC)) {
      playersC[currentPlayer].score++;
      socket.emit("coin-touched", playersC);
      coinC.x = -30;
    }
  } else {
    clearCanvas(context, canvas);
    drawInfo(context, canvas, coords, scoresC[socket.id], playersC.length, drawGame);
    drawOutline(context, coords.playField);
    drawEnd(context, canvas, scoresC[socket.id]);
  }
}

socket.on("player-in", playerID => {
  const player = new Player({ x: coords.random.avatar.x, y: coords.random.avatar.y, id: playerID, score: 0 });
  socket.emit("player-created", player);
});

socket.on("player-pushed", players => {
  playersC = players;
});

socket.on("player-out", players => {
  playersC = players;
});

document.addEventListener("keydown", event => {
  const direction = getDirection(event.key);
  const currentPlayer = playersC.findIndex(player => player.id === socket.id);

  if (direction === "left") {
    playersC[currentPlayer].dx = -playersC[currentPlayer].step;
  } else if (direction === "right") {
    playersC[currentPlayer].dx = playersC[currentPlayer].step;
  } else if (direction === "up") {
    playersC[currentPlayer].dy = -playersC[currentPlayer].step;
  } else if (direction === "down") {
    playersC[currentPlayer].dy = playersC[currentPlayer].step;
  }
});

document.addEventListener("keyup", event => {
  const direction = getDirection(event.key);
  const currentPlayer = playersC.findIndex(player => player.id === socket.id);
  if (direction == "left" || direction == "right") {
    playersC[currentPlayer].dx = 0;
  } else if (direction == "up" || direction == "down") {
    playersC[currentPlayer].dy = 0;
  }

  if (direction) {
    socket.emit("player-stopped", playersC);
  }
});

socket.on("player-moved", players => {
  playersC = players;
});

socket.on("player-stopped", players => {
  playersC = players;
});

socket.on("coin-init", coin => {
  coinC = coin;
});

socket.on("coin-added", coin => {
  coinC = coin;
});

socket.on("player-scores", scores => {
  scoresC = scores;
});

socket.on("game-ended", gameEnded => {
  gameEndedC = gameEnded;
  console.log(gameEndedC);
});

start();
