import ECS from '@fae/ecs';
import ROT from 'rot-js';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';

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
  }

  update(entity) {
    const key = [entity.x, entity.y].join(','); // use X,Y as the key for easy access

    // render either the only or the topmost entity in the cell
    if (!this.cells[key]) {
      this.cells[key] = {entity, z: entity.z, light: this.light[key] || 0};
    } else {
      if (this.cells[key].z < entity.z) {
        this.cells[key].entity = entity;
        this.cells[key].z = entity.z;
      }

      const prevLight = this.cells[key].light;
      const curLight = this.light[key];

      if (prevLight || curLight) { console.log(prevLight, curLight, key) }

      this.cells[key].light = Math.max(prevLight || 0, curLight || 0);
    }

    const renderedEntity = this.cells[key].entity;
    const color = ROT.Color.interpolate([0, 0, 0], renderedEntity.fg, this.cells[key].light);
    this.display.draw(renderedEntity.x, renderedEntity.y, renderedEntity.char, ROT.Color.toRGB(color), renderedEntity.bg);
  }
}

export default RenderSystem;
