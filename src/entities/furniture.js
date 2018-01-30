import ECS from 'mikkpr-ecs';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';
import CollisionComponent from '../components/collision';
import MovementComponent from '../components/movement';
import LightComponent from '../components/light';

class Furniture extends ECS.Entity.with(PositionComponent, GlyphComponent, CollisionComponent) {
  constructor(x, y) {
    super();

    this.x = x;
    this.y = y;
    this.z = 1;

    this.char = ' ';
    this.fg = [255, 255, 255];
    this.bg = 'black';

    this.collides = true;
  }
}

export default Furniture;

export class Lamp extends Furniture.with(LightComponent) {
  constructor({position: {x, y, z}, glyph: {char, fg, bg}, light: {active, color, radius}}) {
    super();

    this.x = x;
    this.y = y;
    this.z = z;

    this.char = char;
    this.fg = fg;
    this.bg = bg;

    this.enableLight = true;
    this.lightColor = color;
    this.lightRadius = radius;
  }
}
