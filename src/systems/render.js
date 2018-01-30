import ECS from 'mikkpr-ecs';
import ROT from 'rot-js';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';

import {posKey} from '../utils';

class RenderSystem extends ECS.System {
  constructor(display, z) {
    super();

    this.display = display;
    this.cells = {};
    this.light = {};
  }

  test(entity) {
    return entity.hasComponents(PositionComponent, GlyphComponent);
  }

  clear() {
    this.cells = {};
    this.light = {};
  }

  update(entity) {
    const key = posKey(entity.x, entity.y); // use X,Y as the key for easy access

    const renderedEntity = this.cells[key].entity;
    const color = ROT.Color.interpolate([0, 0, 0], renderedEntity.fg, this.light[key]);
    this.display.draw(renderedEntity.x, renderedEntity.y, renderedEntity.char, ROT.Color.toRGB(color), renderedEntity.bg);
  }
}

export default RenderSystem;
