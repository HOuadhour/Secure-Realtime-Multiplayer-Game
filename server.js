require("dotenv").config();
const express = require("express");
const expect = require("chai");
const socket = require("socket.io");
const helmet = require("helmet");

const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner.js");

const app = express();

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

function generateCoin() {
  const coin = new Collectible({
    x: Math.floor(Math.random() * (760 - 10) + 10),
    y: Math.floor(Math.random() * (560 - 40) + 40),
    id: Date.now(),
    value: Math.floor(Math.random() * (5 - 2) + 2),
  });
  return coin;
}

let players = [];
let coin = generateCoin();

io.on("connection", socket => {
  socket.emit("player-in", socket.id);
  socket.emit("coin-init", coin);
  socket.on("player-created", player => {
    players.push(player);
    io.emit("player-pushed", players);
  });
  socket.on("player-moved", playersC => {
    players = playersC;
    socket.broadcast.emit("player-moved", players);
  });
  socket.on("player-stopped", playersC => {
    players = playersC;
    socket.broadcast.emit("player-stopped", players);
  });

  socket.on("coin-touched", playersC => {
    // send rank back to clients
    players = playersC;
    const scores = {};
    playersC
      .sort((a, b) => b.score - a.score)
      .forEach((player, idx) => {
        scores[player.id] = idx + 1;
      });

    io.emit("player-scores", scores);

    if (playersC[0].score === 50) {
      io.emit("game-ended", true);
    }

    coin = generateCoin();
    io.emit("coin-added", coin);
  });

  socket.on("disconnect", () => {
    players = players.filter(player => player.id !== socket.id);
    io.emit("player-out", players);
  });
});
