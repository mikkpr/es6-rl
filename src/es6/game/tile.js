import Glyph from './glyph';

export default class Tile extends Glyph {
  constructor(properties = {}) {
    super(properties);

    this._isWalkable = properties.isWalkable || false;
    this._isDiggable = properties.isDiggable || false;
  }

  isWalkable() {
    return this._isWalkable;
  }

  isDiggable() {
    return this._isDiggable;
  }
}

export const NullTile = new Tile({});
export const FloorTile = new Tile({
  char: '.',
  isWalkable: true,
});
export const WallTile = new Tile({
  char: '#',
  fg: 'goldenrod',
  isDiggable: true,
});
export const StairsUpTile = new Tile({
  char: '<',
  fg: 'white',
  isWalkable: true,
});
export const StairsDownTile = new Tile({
  char: '>',
  fg: 'white',
  isWalkable: true,
});
