import ECS from '@fae/ecs';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';
import InventoryComponent from '../components/inventory';
import CollisionComponent from '../components/collision';

class Tile extends ECS.Entity.with(PositionComponent, GlyphComponent, InventoryComponent) {
  constructor({x, y, char, fg, bg, walkable}) {
    super();

    this.x = x;
    this.y = y;
    this.z = 0;

    this.char = char;
    this.fg = fg;
    this.bg = bg;
    
    this.walkable = walkable;
  }
}

class FloorTile extends Tile {
  constructor({x, y}) {
    super({x, y, char: '.', fg: '#666', bg: 'black', walkable: true});
  }
}

class WallTile extends Tile.with(CollisionComponent) {
  constructor({x, y}) {
    super({x, y, char: '#', fg: '#333', bg: 'black', walkable: false});
  }
}

export default Tile;
export {
  FloorTile,
  WallTile
}
