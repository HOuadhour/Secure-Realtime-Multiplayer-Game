import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";
import coords from "./Canvas.mjs";
import { loadImages, drawOutline, drawInfo, clearCanvas, getDirection, drawEnd } from "./utils.mjs";

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

let playersClient = [];
let coinClient;
let frame;
let endGame = false;

function drawGame() {
  clearCanvas(context, canvas);

  playersClient.forEach(player => {
    player.drawPlayers(context, imageObjects.slice(0, 2), socket, playersClient);
  });
  drawInfo(context, canvas, coords.margin);
  drawOutline(context, coords.playField);
  coinClient?.draw(context, imageObjects.slice(2));

  const currentPlayer = playersClient.find(player => player.id === socket.id);
  if (currentPlayer.collision(coinClient)) {
    currentPlayer.score++;
    coinClient.x = -30;
    socket.emit("coin-touched", currentPlayer);
  }

  if (!endGame) {
    frame = requestAnimationFrame(drawGame);
  } else {
    const currentPlayer = playersClient.find(player => player.id === socket.id);
    clearCanvas(context, canvas);
    playersClient.forEach(player => {
      player.drawPlayers(context, imageObjects.slice(0, 2), socket, playersClient);
    });
    drawInfo(context, canvas, coords.margin);
    drawOutline(context, coords.playField);
    drawEnd(context, canvas, currentPlayer.score);
  }
}

function keyDown(event) {
  const currentPlayer = playersClient.find(player => player.id === socket.id);
  const direction = getDirection(event.key);
  if (direction) {
    currentPlayer.startMoving(direction);
    socket.emit("player-moved", { direction, currentPlayer });
  }
}

function keyUp(event) {
  const currentPlayer = playersClient.find(player => player.id === socket.id);
  const direction = getDirection(event.key);
  if (direction) {
    currentPlayer.stopMoving(direction);
    socket.emit("player-stopped", { direction, currentPlayer });
  }
}

socket.on("game-start", ({ id, playersServer, coinServer }) => {
  console.log(`${id} connected.`);
  cancelAnimationFrame(frame);
  playersClient = playersServer.map(player => new Player(player));
  coinClient = new Collectible(coinServer);

  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  socket.on("player-moved", ({ direction, otherPlayer }) => {
    const movingPlayer = playersClient.find(player => player.id === otherPlayer.id);
    movingPlayer.startMoving(direction);

    // in case of lag
    movingPlayer.x = otherPlayer.x;
    movingPlayer.y = otherPlayer.y;
  });

  socket.on("player-stopped", ({ direction, otherPlayer }) => {
    const stoppingPlayer = playersClient.find(player => player.id === otherPlayer.id);
    stoppingPlayer.stopMoving(direction);

    // in case of lag
    stoppingPlayer.x = otherPlayer.x;
    stoppingPlayer.y = otherPlayer.y;
  });

  socket.on("coin-touched", ({ coinServer, otherPlayer }) => {
    const toucher = playersClient.find(player => player.id === otherPlayer.id);
    coinClient = new Collectible(coinServer);
    toucher.score = otherPlayer.score;
  });

  socket.on("game-end", otherPlayer => {
    const winner = playersClient.find(player => player.id === otherPlayer.id);
    winner.score = otherPlayer.score;
    endGame = true;
    playersClient.forEach(player => {
      if (player.id === socket.id) {
        console.log(`Your score is ${player.score}/50`);
      } else {
        console.log(`Their score is ${player.score}/50`);
      }
    });
  });

  socket.on("player-removed", ({ id, playersServer }) => {
    console.log(`${id} disconnected.`);
    playersClient = playersServer.map(player => new Player(player));
  });

  drawGame();
});
