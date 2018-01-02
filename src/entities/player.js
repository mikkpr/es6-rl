import ECS from '@fae/ecs';

import PositionComponent from '../components/position';
import GlyphComponent from '../components/glyph';
import PlayerInputComponent from '../components/player_input';
import CollisionComponent from '../components/collision';
import MovementComponent from '../components/movement';
import LightComponent from '../components/light';

class Player extends ECS.Entity.with(PositionComponent, GlyphComponent, MovementComponent, CollisionComponent, PlayerInputComponent, LightComponent) {
  constructor(x, y) {
    super();

    this.x = x;
    this.y = y;
    this.z = 1;

    this.char = '@';
    this.fg = [255, 255, 255];
    this.bg = 'black';
    
    this.lightRadius = 8;
    this.enableLight = true;
    
    this.collides = true;
  }
}

export default Player;
