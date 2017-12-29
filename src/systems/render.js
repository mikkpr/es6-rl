import ECS from '@fae/ecs';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';

class RenderSystem extends ECS.System {
  constructor(display) {
    super();
    this.display = display;
  }

  test(entity) {
    return entity.hasComponents(PositionComponent, GlyphComponent);
  }

  update(entity) {
    this.display.draw(entity.x, entity.y, entity.char, entity.fg, entity.bg);
  }
}

export default RenderSystem;
