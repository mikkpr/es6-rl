import Entity from './entity';
import { FungusTemplate } from './templates';

export const Moveable = {
  name: 'Moveable',
  tryMove(x, y, map) {
    const tile = map.getTile(x, y);
    const target = map.getEntityAt(x, y);

    if (target) {
      if (this.hasMixin('Attacker')) {
        this.attack(target);
        return true;
      }
    } else if (tile.isWalkable()) {
      this._x = x;
      this._y = y;
      return true;
    } else if (tile.isDiggable()) {
      if (this.hasMixin('Digger')) {
        this.dig(x, y, map);
        return true;
      }
    }
    return false;
  },
};

export const PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',

  act() {
    // GAME.refresh();
    this.getMap().getEngine().lock();
  },
};

export const FungusActor = {
  name: 'FungusActor',
  groupName: 'Actor',
  init() {
    this._growthsRemaining = 5;
  },
  act() {
    if (this._growthsRemaining > 0) {
      if (Math.random() <= 0.02) {
        const xOffset = Math.floor(Math.random() * 3) - 1;
        const yOffset = Math.floor(Math.random() * 3) - 1;
        if (xOffset !== 0 || yOffset !== 0) {
          if (this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset)) {
            const entity = new Entity(FungusTemplate);
            entity.setX(this.getX() + xOffset);
            entity.setY(this.getY() + yOffset);
            this.getMap().addEntity(entity);
            this._growthsRemaining--;
          }
        }
      }
    }
  },
};

export const Destructible = {
  name: 'Destructible',
  init() {
    this._hp = 1;
  },
  takeDamage(attacker, damage) {
    this._hp -= damage;
    if (this._hp <= 0) {
      this.getMap().removeEntity(this);
    }
  },
};

export const Digger = {
  name: 'SimpleDigger',
  groupName: 'Digger',
  dig(x, y, map) {
    map.dig(x, y);
  },
};

export const SimpleAttacker = {
  name: 'SimpleAttacker',
  groupName: 'Attacker',
  attack(target) {
    if (target.hasMixin('Destructible')) {
      target.takeDamage(this, 1);
    }
  },
};
