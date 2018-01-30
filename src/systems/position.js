import ECS from 'mikkpr-ecs';
import ROT from 'rot-js';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';
import InventoryComponent from '../components/inventory';

import {posKey} from '../utils';

class PositionSystem extends ECS.System {
  constructor(renderer) {
    super();

    this.renderer = renderer;
  }

  test(entity) {
    return entity.hasComponents(PositionComponent, GlyphComponent);
  }

  clear() {
    this.renderer.cells = {};
  }

  update(entity) {
    const key = posKey(entity.x, entity.y); // use X,Y as the key for easy access

    // render either the only or the topmost entity in the cell
    if (!this.renderer.cells[key]) {
      let renderedEntity = entity;
      if (entity.hasComponent(InventoryComponent) && entity.contents.length > 0) {
        renderedEntity = entity.contents[0];
      }
      this.renderer.cells[key] = {entity: renderedEntity, z: entity.z};
    } else {
      if (this.renderer.cells[key].z < entity.z) {
        this.renderer.cells[key].entity = entity;
        this.renderer.cells[key].z = entity.z;
      }
    }
  }
}

export default PositionSystem;
