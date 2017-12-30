import {FloorTile, WallTile} from './entities/tile';
import ROT from 'rot-js';

const createMap = (width, height) => {
  const tiles = [];
  for (let idx = 0; idx < width * height; idx++) {
    const x = idx % width;
    const y = Math.floor((idx - x) / width);
    const isWall = (x == 0 || y == 0 || x == width - 1 || y == height - 1);
    const tileType = isWall ? WallTile : FloorTile;
    tiles.push(new tileType({x, y}));
  }
  return tiles;
}

const setupDisplay = (width, height) => {
  const displaySettings = {
    width: width,
    height: height,
    fontSize: 16,
    fontFamily: 'Fira Mono',
    spacing: 0.9,
    layout: 'rect',
    fg: 'white',
    forceSquareRatio: true
  };
  const container = document.getElementById('main');
  container.innerHTML = '';
  const display = new ROT.Display(displaySettings);
  container.appendChild(display.getContainer());
  return display;
}

export {
  createMap,
  setupDisplay
}
