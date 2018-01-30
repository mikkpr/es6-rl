import ECS from 'mikkpr-ecs';

import GlyphComponent from '../components/glyph';
import DescriptionComponent from '../components/description';

class Item extends ECS.Entity.with(GlyphComponent, DescriptionComponent) {
  constructor(name, char, fg, bg, owner) {
    super();

    this.name = name || '';
    this.char = char || ',';
    this.fg = fg || 'white';
    this.bg = bg || 'black';
  }
}

export default Item;
