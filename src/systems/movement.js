import ECS from 'mikkpr-ecs';

import PositionComponent from '../components/position';
import CollisionComponent from '../components/collision';
import MovementComponent from '../components/movement';

class MovementSystem extends ECS.System {
  constructor(renderer) {
    super();

    this.renderer = renderer;
    this.initialDestinations = {
      DIR_LEFT: false,
      DIR_RIGHT: false,
      DIR_UP: false,
      DIR_DOWN: false
    };
  }

  test(entity) {
    return entity.hasComponents(PositionComponent, MovementComponent, CollisionComponent);
  }

  resetDestinations(entity) {
    entity.validDestinations = Object.assign({}, this.initialDestinations);
  }

  update(entity) {
    this.resetDestinations(entity);

    const {x, y} = entity;

    entity.validDestinations['DIR_LEFT'] = this.checkDir('DIR_LEFT', x, y);
    entity.validDestinations['DIR_RIGHT'] = this.checkDir('DIR_RIGHT', x, y);
    entity.validDestinations['DIR_UP'] = this.checkDir('DIR_UP', x, y);
    entity.validDestinations['DIR_DOWN'] = this.checkDir('DIR_DOWN', x, y);
  }

  checkDir(direction, x, y) {
    const dirToCell = {
      DIR_LEFT: `${x - 1},${y}`,
      DIR_RIGHT: `${x + 1},${y}`,
      DIR_UP: `${x},${y - 1}`,
      DIR_DOWN: `${x},${y + 1}`
    }
    const cell = this.renderer.cells[dirToCell[direction]];

    return !(
      !cell ||
      (cell.entity.hasComponent(CollisionComponent) && cell.entity.collides)
    )
  }
}

export default MovementSystem;
