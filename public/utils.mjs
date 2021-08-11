export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

export function loadImages(images) {
  return images.map(src => {
    const img = new Image();
    img.src = src;
    return img;
  });
}

export function clearCanvas(context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawOutline(context, playField) {
  context.strokeStyle = "white";
  context.strokeRect(playField.x, playField.y, playField.w, playField.h);
}

export function drawInfo(context, canvas, coords, score, players, callback) {
  context.font = "25px monospace";
  context.fillStyle = "white";
  context.textAlign = "start";
  context.textBaseline = "hanging";
  context.fillText("Controls: WASD", coords.margin, coords.margin);
  context.textAlign = "center";
  context.fillStyle = "yellow";
  context.fillText("CoinRace", canvas.width / 2, coords.margin);
  context.fillStyle = "white";
  context.textAlign = "right";
  context.fillText(`Rank: ${score || 1} / ${players}`, canvas.width - coords.margin, coords.margin);
  requestAnimationFrame(callback);
}

export function drawPlayers(context, images, players, socket) {
  players.forEach(player => {
    if (socket.id === player.id) {
      context.drawImage(images[0], player.x, player.y);
    } else {
      context.drawImage(images[1], player.x, player.y);
    }
  });
}

export function movePlayer(playerObj, playField) {
  const player = playerObj;
  player.x += player.dx;
  player.y += player.dy;

  if (player.x <= playField.left) {
    player.x = playField.left;
  }
  if (player.x + player.w >= playField.right) {
    player.x = playField.right - player.w;
  }
  if (player.y <= playField.top) {
    player.y = playField.top;
  }
  if (player.y + player.h >= playField.bottom) {
    player.y = playField.bottom - player.h;
  }

  return player;
}

export function getDirection(key) {
  const left = ["ArrowLeft", "a", "A"];
  const right = ["ArrowRight", "d", "D"];
  const up = ["ArrowUp", "w", "W"];
  const down = ["ArrowDown", "s", "S"];

  if (left.includes(key)) return "left";
  else if (right.includes(key)) return "right";
  else if (up.includes(key)) return "up";
  else if (down.includes(key)) return "down";
}

export function drawCoin(context, images, coin) {
  if (coin) {
    context.drawImage(images[coin.value], coin.x, coin.y);
  }
}

export function drawEnd(context, canvas, score) {
  context.font = "28px monospace";
  context.textAlign = "center";
  if (score === 1) {
    context.fillText("You won the game, refresh and start again", canvas.width / 2, canvas.height / 2);
  } else {
    context.fillText("You lost the game, refresh and start again", canvas.width / 2, canvas.height / 2);
  }
}

export function isEaten(player, coin) {
  if (player && coin) {
    if (
      player.x < coin.x + coin.w &&
      player.x + player.w > coin.x &&
      player.y < coin.y + coin.h &&
      player.y + player.h > coin.y
    ) {
      return true;
    }
    return false;
  }
}
