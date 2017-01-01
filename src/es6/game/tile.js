import Glyph from './glyph';

export default class Tile {
  constructor(glyph) {
    this._glyph = glyph;
  }

  getGlyph() {
    return this._glyph;
  }
}

export const NullTile = new Tile(new Glyph());
export const FloorTile = new Tile(new Glyph('.'));
export const WallTile = new Tile(new Glyph('#', 'goldenrod'));
