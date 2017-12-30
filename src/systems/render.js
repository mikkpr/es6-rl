import ECS from '@fae/ecs';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';

class RenderSystem extends ECS.System {
  constructor(display, z) {
    super();

    this.display = display;
    this.cells = {};
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
    if (!this.cells[key] || this.cells[key].z < entity.z) {
      this.cells[key] = {entity, z: entity.z};
    }

    const renderedEntity = this.cells[key].entity;
    this.display.draw(renderedEntity.x, renderedEntity.y, renderedEntity.char, renderedEntity.fg, renderedEntity.bg);
  }
}

export default RenderSystem;
