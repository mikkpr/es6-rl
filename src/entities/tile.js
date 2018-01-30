import ECS from 'mikkpr-ecs';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';
import InventoryComponent from '../components/inventory';
import CollisionComponent from '../components/collision';
import MaterialComponent from '../components/material';
import LightComponent from '../components/light';

class Tile extends ECS.Entity.with(PositionComponent, GlyphComponent, InventoryComponent, MaterialComponent, LightComponent) {
  constructor({x, y, char, fg, bg, walkable}) {
    super();

    this.x = x;
    this.y = y;
    this.z = 0;

    this.char = char;
    this.fg = fg;
    this.bg = bg;

    this.enableLight = false;

    this.walkable = walkable;
  }
}

class FloorTile extends Tile {
  constructor({x, y}) {
    super({x, y, char: '.', fg: [255, 255, 255], bg: 'black', walkable: true});
    this._lightsourceActive = false;
  }
}

class WallTile extends Tile.with(CollisionComponent) {
  constructor({x, y}) {
    super({x, y, char: '#', fg: [255, 255, 255], bg: 'black', walkable: false});
    this.setProperty('BLOCKS_LIGHT');
  }
}

export {
  FloorTile,
  WallTile
}
