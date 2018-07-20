import ROT from 'rot-js';

import {FloorTile, WallTile} from './entities/tile';

const createMap = (width, height) => {
  const tiles = [];
  tiles.addItem = function(item) {
    const {x, y, id} = item;
    const idx = height * y + x;
    if (tiles[idx]) {
      tiles[idx].addItem(id);
    }
  };
  const map = (
    'WWWWWWWWWWWWWWWWWWWWW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFFFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFIFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WWWWWFWWWWWWWWWFWWWWW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFFFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WFFFFFFFFFWFFFFFFFFFW' +
    'WWWWWWWWWWWWWWWWWWWWW'
  ).split('');

  map.forEach((tile, idx) => {
    const x = idx % width;
    const y = Math.floor((idx - x) / width);
    const tileType = tile === 'W' ? WallTile : FloorTile;
    tiles.push(new tileType({x, y}));
  });
  return tiles;
};

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
};

const posKey = (x, y) => `${x},${y}`;

export {createMap, setupDisplay, posKey};
