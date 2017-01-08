import Glyph from './glyph';

export default class Tile extends Glyph {
  constructor(properties = {}) {
    super(properties);

    this._walkable = properties.walkable || false;
    this._diggable = properties.diggable || false;
    this._blocksLight = (typeof properties.blocksLight !== 'undefined') ? properties.blocksLight : false;
  }

  isWalkable() {
    return this._walkable;
  }

  isDiggable() {
    return this._diggable;
  }

  isBlockingLight() {
    return this._blocksLight;
  }
}

export const NullTile = new Tile({});

export const FloorTile = new Tile({
  char: '.',
  walkable: true,
  blocksLight: false,
});

export const WallTile = new Tile({
  char: '#',
  fg: 'goldenrod',
  diggable: true,
  blocksLight: true,
});

export const StairsUpTile = new Tile({
  char: '<',
  fg: 'white',
  walkable: true,
  blocksLight: false,
});

export const StairsDownTile = new Tile({
  char: '>',
  fg: 'white',
  walkable: true,
  blocksLight: false,
});
