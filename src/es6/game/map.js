import { NullTile } from './tile';

export default class Map {
  constructor(tiles) {
    this._tiles = tiles;
    this._width = tiles.length;
    this._height = tiles[0].length;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  getTile(x, y) {
    let ret = NullTile;
    if (!(x < 0 || x >= this._width || y < 0 || y >= this.height)) {
      ret = this._tiles[x][y] || ret;
    }
    return ret;
  }
}
