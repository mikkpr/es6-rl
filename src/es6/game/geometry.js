const getLine = (X, Y, endX, endY) => {
  let startX = X;
  let startY = Y;

  const points = [];
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  const sx = (startX < endX) ? 1 : -1;
  const sy = (startY < endY) ? 1 : -1;

  let err = dx - dy;
  let e2;

  while (true) {
    points.push({ x: startX, y: startY });

    if (startX === endX && startY === endY) {
      break;
    }

    e2 = err * 2;
    if (e2 > -dx) {
      err -= dy;
      startX += sx;
    }
    if (e2 < dx) {
      err += dx;
      startY += sy;
    }
  }

  return points;
};

export {
  getLine,
};
