import ROT from 'rot-js';
import Item from './item';
class Tile {
  constructor({fg, bg, char, solid}) {
    this.fg = fg;
    this.bg = bg;
    this.char = char;
    this.solid = solid;
  }
}

const TILES = {
  floor: new Tile({fg: 'white', bg: 'black', char: '.', solid: false}),
  wall: new Tile({fg: 'white', bg: 'black', char: '#', solid: true})
};

export default class Map {
  constructor({width, height}) {
    this.width = width;
    this.height = height;
    this.tiles = this.buildMap();
    this.spawnItems();
  }

  buildMap() {
    const tiles = {};
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        tiles[`${x},${y}`] = {
          tile: TILES.floor,
          visible: false,
          explored: false,
          x: x,
          y: y,
          contents: []
        };
      }
    }

    for (let x = 0; x < this.width; x++) {
      tiles[`${x},0`].tile = TILES.wall;
      tiles[`${x},${this.height - 1}`].tile = TILES.wall;
    }
    for (let y = 0; y < this.height; y++) {
      tiles[`0,${y}`].tile = TILES.wall;
      tiles[`${this.width - 1},${y}`].tile = TILES.wall;
    }
    return tiles;
  }

  spawnItems() {
    const randX = Math.max(1, Math.floor(ROT.RNG.getUniform() * this.width - 1));
    const randY = Math.max(1, Math.floor(ROT.RNG.getUniform() * this.height - 1));
    console.log(randX, randY);

    this.getTile(randX, randY).contents.push(
      new Item({
        id: 'TORCH',
        name: 'a torch',
        description: 'a torch is here, slowly burning',
        char: '(',
        fg: 'yellow'
      })
    );
  }

  getTile(x, y) {
    return this.tiles[[x, y].join(',')];
  }

  hasTileFor(x, y) {
    const key = [x, y].join(',');
    return Object.keys(this.tiles).includes(key);
  }

  drawExploredMap(display) {
    Object.values(this.tiles).forEach(tile => {
      if (tile.explored) {
        display.draw(tile.x, tile.y, tile.tile.char, '#333');
      }
    });
  }
}