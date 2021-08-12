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

export function drawInfo(context, canvas, margin) {
  context.font = "25px monospace";
  context.fillStyle = "white";
  context.textAlign = "start";
  context.textBaseline = "hanging";
  context.fillText("Controls: WASD", margin, margin);
  context.textAlign = "center";
  context.fillStyle = "yellow";
  context.fillText("CoinRace", canvas.width / 2, margin);
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

export function drawEnd(context, canvas, score) {
  context.font = "28px monospace";
  context.textAlign = "center";
  if (score >= 50) {
    context.fillText("You won the game, refresh and start again", canvas.width / 2, canvas.height / 2);
  } else {
    context.fillText("You lost the game, refresh and start again", canvas.width / 2, canvas.height / 2);
  }
}
