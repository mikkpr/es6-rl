import ECS from '@fae/ecs';
import ROT from 'rot-js';

import PlayerInputComponent from '../components/player_input';

class InputSystem extends ECS.System {
  constructor() {
    super();
    this._moveDelta = [0, 0];

    this._player = null;
    
    document.addEventListener('keyup', e => {
      var code = e.keyCode;

      switch (code) {
        case ROT.VK_LEFT:
          this._moveDelta = [-1, 0];
          break;
        case ROT.VK_RIGHT:
          this._moveDelta = [1, 0];
          break;
        case ROT.VK_DOWN:
          this._moveDelta = [0, 1];
          break;
        case ROT.VK_UP:
          this._moveDelta = [0, -1];
          break;
        default:
          this._moveDelta = [0, 0];
          break;
      }
    });
  }

  enter(entity) {
    this._player = entity;
  }

  exit(entity) {
    this._player = null;
  }

  test(entity) {
    return entity.hasComponent(PlayerInputComponent);
  }

  update(entity) {
    const [dx, dy] = this._moveDelta;

    if (this._player) {
      if (dx != 0 || dy != 0) {
        this._player.x += dx;
        this._player.y += dy;
        this._moveDelta = [0, 0];
      }
    }
  }
}

export default InputSystem;
