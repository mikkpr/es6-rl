import Glyph from './glyph';

export default class Tile extends Glyph {
  constructor(properties = {}) {
    super(properties);

    this._walkable = properties.walkable || false;
    this._diggable = properties.diggable || false;
    this._blocksLight = (typeof properties.blocksLight !== 'undefined') ? properties.blocksLight : false;
    this._description = properties.description || '';
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

  getDescription() {
    return this._description;
  }
}

export const NullTile = new Tile({
  description: '(unknown)',
});

export const FloorTile = new Tile({
  char: '.',
  walkable: true,
  blocksLight: false,
  description: 'A cave floor',
});

export const WallTile = new Tile({
  char: '#',
  fg: 'goldenrod',
  diggable: true,
  blocksLight: true,
  description: 'A cave wall',
});

export const StairsUpTile = new Tile({
  char: '<',
  fg: 'white',
  walkable: true,
  blocksLight: false,
  description: 'A rock staircase leading upwards',
});

export const StairsDownTile = new Tile({
  char: '>',
  fg: 'white',
  walkable: true,
  blocksLight: false,
  description: 'A rock staircase leading downwards',
});

export const HoleToCavernTile = new Tile({
  char: 'O',
  fg: 'white',
  walkable: true,
  blocksLight: false,
  description: 'A great dark hole in the ground',
});

export const WaterTile = new Tile({
  char: '~',
  fg: 'blue',
  walkable: false,
  blocksLight: false,
  description: 'Murky blue water',
});
