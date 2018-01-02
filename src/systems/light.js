import ECS from '@fae/ecs';
import ROT from 'rot-js';

import PositionComponent from '../components/position';
import LightComponent from '../components/light';
import MaterialComponent from '../components/material';

import {posKey} from '../utils';

class LightSystem extends ECS.System {
  constructor(renderer) {
    super();

    this.renderer = renderer;
  }

  test(entity) {
    return entity.hasComponents(LightComponent, PositionComponent) && entity.lightsourceActive;
  }

  update(entity) {
    const ex = entity.x;
    const ey = entity.y;
    const er = entity.lightRadius;

    const fov = new ROT.FOV.RecursiveShadowcasting(this.lightPasses.bind(this));

    fov.compute(ex, ey, er, (x, y, r, visibility) => {
      this.renderer.light[posKey(x, y)] = visibility ? +(1 - r / er * visibility).toFixed(2) : 0;
    });
  }

  lightPasses(x, y) {
    const key = posKey(x, y);
    const cell = this.renderer.cells[key];

    if (!cell || (cell && cell.entity.hasComponent(MaterialComponent) && cell.entity.hasProperty('BLOCKS_LIGHT'))) {
      return false;
    } else {
      return true;
    }
  }
}

export default LightSystem;
