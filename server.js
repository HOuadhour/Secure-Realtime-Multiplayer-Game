require("dotenv").config();
const express = require("express");
const expect = require("chai");
const socket = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");

const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner.js");

const app = express();

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.hidePoweredBy({ setTo: "PHP 7.4.3" }));
app.use(helmet.noCache());
app.use("/public", express.static(process.cwd() + "/public"));
app.use("/assets", express.static(process.cwd() + "/assets"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log("Tests are not valid:");
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing

const io = socket(server);
const Collectible = require("./public/Collectible.mjs");
const { getRandomInt } = require("./public/utils.mjs");
const Player = require("./public/Player.mjs");

function generateCoin() {
  const coin = new Collectible({
    x: getRandomInt(10, 760),
    y: getRandomInt(40, 560),
    id: Date.now(),
    value: getRandomInt(0, 3),
  });
  return coin;
}

let playersServer = [];
let coinServer = generateCoin();

io.on("connection", socket => {
  const playerExists = playersServer.findIndex(player => player.id === socket.id);
  if (playerExists === -1) {
    // create a new player if it is not already in the list
    const player = new Player({ score: 0, id: socket.id });
    playersServer.push(player);
  }
  io.emit("game-start", { id: socket.id, playersServer, coinServer });

  socket.on("player-moved", ({ direction, currentPlayer }) => {
    const otherPlayer = playersServer.find(player => player.id === currentPlayer.id);
    if (otherPlayer) {
      otherPlayer.x = currentPlayer.x;
      otherPlayer.y = currentPlayer.y;
      socket.broadcast.emit("player-moved", { direction, otherPlayer });
    }
  });

  socket.on("player-stopped", ({ direction, currentPlayer }) => {
    const otherPlayer = playersServer.find(player => player.id === currentPlayer.id);
    if (otherPlayer) {
      otherPlayer.x = currentPlayer.x;
      otherPlayer.y = currentPlayer.y;
      socket.broadcast.emit("player-stopped", { direction, otherPlayer });
    }
  });

  socket.on("coin-touched", toucher => {
    const otherPlayer = playersServer.find(player => player.id === toucher.id);
    if (otherPlayer) {
      otherPlayer.score = toucher.score;
      coinServer = generateCoin();

      if (otherPlayer.score >= 50) {
        io.emit("game-end", otherPlayer);
      } else {
        io.emit("coin-touched", { coinServer, otherPlayer });
      }
    }
  });

  socket.on("game-end", winner => {
    const otherPlayer = playersServer.find(player => player.id === winner.id);
    otherPlayer.score = winner.score;
    io.emit("game-end", otherPlayer);
  });

  socket.on("disconnect", () => {
    playersServer = playersServer.filter(player => player.id !== socket.id);
    io.emit("player-removed", { id: socket.id, playersServer });
  });
});
