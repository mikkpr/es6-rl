import ROT from 'rot-js';
import { FloorTile, WallTile, StairsUpTile, StairsDownTile } from './tile';
import Game from './index';

export default class Builder {
  constructor(width, height, depth) {
    this._width = width;
    this._height = height;
    this._depth = depth;
    this._tiles = new Array(depth);
    this._regions = new Array(depth);

    for (let z = 0; z < depth; z++) {
      this._tiles[z] = this.generateLevel();
      this._regions[z] = new Array(width);
      for (let x = 0; x < width; x++) {
        this._regions[z][x] = new Array(height);

        for (let y = 0; y < height; y++) {
          this._regions[z][x][y] = 0;
        }
      }
    }

    for (let z = 0; z < this._depth; z++) {
      this.setupRegions(z);
    }

    this.connectAllRegions();
  }

  getTiles() {
    return this._tiles;
  }

  getDepth() {
    return this._depth;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  generateLevel() {
    const map = new Array(this._width);
    const generator = new ROT.Map.Cellular(this._width, this._height);
    const totalIterations = 3;

    for (let w = 0; w < this._width; w++) {
      map[w] = new Array(this._height);
    }

    generator.randomize(0.5);
    for (let i = 0; i < totalIterations - 1; i++) {
      generator.create();
    }

    generator.create((x, y, v) => {
      if (v === 1) {
        map[x][y] = FloorTile;
      } else {
        map[x][y] = WallTile;
      }
    });
    return map;
  }

  canFillRegion(x, y, z) {
    // make sure tile is within bounds
    if (x < 0 || y < 0 || z < 0 || x >= this._width || y >= this._height || z >= this._depth) {
      return false;
    }

    // make sure tile does not have a region
    if (this._regions[z][x][y] !== 0) {
      return false;
    }

    // make sure tile is walkable
    return this._tiles[z][x][y].isWalkable();
  }

  fillRegion(region, x, y, z) {
    const tiles = [{ x, y }];
    let tilesFilled = 1;
    let tile;
    let neighbors;

    // update original tile's region
    this._regions[z][x][y] = region;

    // loop until we have tiles to process
    while (tiles.length > 0) {
      tile = tiles.pop();

      neighbors = Game.getNeighborPositions(tile.x, tile.y);

      // loop through all the neighbors and add them to the processed tiles list
      while (neighbors.length > 0) {
        tile = neighbors.pop();
        if (this.canFillRegion(tile.x, tile.y, z)) {
          this._regions[z][tile.x][tile.y] = region;
          tiles.push(tile);
          tilesFilled++;
        }
      }
    }
    return tilesFilled;
  }

  // fill all tiles on the given depth level with the given region with walls
  removeRegion(region, z) {
    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._height; y++) {
        if (this._regions[z][x][y] === region) {
          this._regions[z][x][y] = 0;
          this._tiles[z][x][y] = WallTile;
        }
      }
    }
  }

  setupRegions(z) {
    let region = 1;
    let tilesFilled;

    // go through all the tiles on the level, trying to fill a region
    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._height; y++) {
        if (this.canFillRegion(x, y, z)) {
          // try to fill
          tilesFilled = this.fillRegion(region, x, y, z);
          // remove the region if it is too small
          if (tilesFilled <= 20) {
            this.removeRegion(region, z);
          } else {
            region++;
          }
        }
      }
    }
  }

  findRegionOverlaps(z, r1, r2) {
    const matches = [];
    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._height; y++) {
        if (this._tiles[z][x][y] === FloorTile && this._tiles[z + 1][x][y] === FloorTile &&
        this._regions[z][x][y] === r1 && this._regions[z + 1][x][y] === r2) {
          matches.push({ x, y });
        }
      }
    }
    return matches.randomize();
  }

  connectRegions(z, r1, r2) {
    const overlap = this.findRegionOverlaps(z, r1, r2);

    if (overlap.length === 0) { return false; }

    const point = overlap[0];

    this._tiles[z][point.x][point.y] = StairsDownTile;
    this._tiles[z + 1][point.x][point.y] = StairsUpTile;

    return true;
  }

  // try to connect all regions, starting from the top
  connectAllRegions() {
    for (let z = 0; z < this._depth - 1; z++) {
      // iterate through all tiles and try to connect neighboring regions on diff. depth levels
      // store connections as strings for lookup
      const connected = {};
      let key;
      for (let x = 0; x < this._width; x++) {
        for (let y = 0; y < this._height; y++) {
          key = `${this._regions[z][x][y]},${this._regions[z + 1][x][y]}`;

          // connect if both tiles are floors and there isn't a connection yet
          if (
            this._tiles[z][x][y] === FloorTile &&
            this._tiles[z + 1][x][y] === FloorTile &&
            !connected[key]
          ) {
            this.connectRegions(z, this._regions[z][x][y], this._regions[z + 1][x][y]);
            connected[key] = true;
          }
        }
      }
    }
  }
}
