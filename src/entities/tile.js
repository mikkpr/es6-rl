import ECS from '@fae/ecs';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';

class Tile extends ECS.Entity.with(PositionComponent, GlyphComponent, InventoryComponent) {
  constructor({x, y, char, fg, bg, walkable}) {
    super();

    this.x = x;
    this.y = y;

    this.char = char;
    this.fg = fg;
    this.bg = bg;
    
    this.walkable = walkable;
  }
}

export default Tile;
