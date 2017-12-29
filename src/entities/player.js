import ECS from '@fae/ecs';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';
import PlayerInputComponent from '../components/player_input';

class Player extends ECS.Entity.with(PositionComponent, GlyphComponent, PlayerInputComponent) {
  constructor(x, y) {
    super();

    this.x = x;
    this.y = y;

    this.char = '@';
    this.fg = 'white';
    this.bg = 'black';
  }
}

export default Player;
