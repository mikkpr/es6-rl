import Game from './index';
import DynamicGlyph from './dynamicglyph';
import { StairsUpTile, StairsDownTile } from './tile';

export default class Entity extends DynamicGlyph {
  constructor(properties = {}) {
    super(properties);
    this._x = properties.x || 0;
    this._y = properties.y || 0;
    this._z = properties.z || 0;
    this._speed = properties.speed || 1000;
    this._map = null;
    this._alive = true;
  }

  isAlive() {
    return this._alive;
  }

  kill(message) {
    if (!this._alive) {
      return;
    }
    this._alive = false;
    if (message) {
      Game.sendMessage(this, message);
    } else {
      Game.sendMessage(this, 'You have died!');
    }

    if (this.hasMixin('PlayerActor')) {
      this.act();
    } else {
      this.getMap().removeEntity(this);
    }
  }

  setSpeed(speed) {
    this._speed = speed;
  }

  getSpeed() {
    return this._speed;
  }

  setX(x) {
    this._x = x;
  }

  setY(y) {
    this._y = y;
  }

  setZ(z) {
    this._z = z;
  }

  getX() {
    return this._x;
  }

  getY() {
    return this._y;
  }

  getZ() {
    return this._z;
  }

  setMap(map) {
    this._map = map;
  }

  getMap() {
    return this._map;
  }

  setPosition(x, y, z) {
    const oldX = this._x;
    const oldY = this._y;
    const oldZ = this._z;

    this._x = x;
    this._y = y;
    this._z = z;


    if (this._map) {
      this._map.updateEntityPosition(this, oldX, oldY, oldZ);
    }
  }

  tryMove(x, y, z) {
    const tile = this._map.getTile(x, y, this.getZ());
    const target = this._map.getEntityAt(x, y, this.getZ());

    if (z < this.getZ()) {
      if (tile !== StairsUpTile) {
        Game.sendMessage(this, "You can't go up here!");
      } else {
        Game.sendMessage(this, 'You ascend to level %d', [z + 1]);
        this.setPosition(x, y, z);
      }
    } else if (z > this.getZ()) {
      if (tile !== StairsDownTile) {
        Game.sendMessage(this, "You can't go down here!");
      } else {
        Game.sendMessage(this, 'You descend to level %d', [z + 1]);
        this.setPosition(x, y, z);
      }
    } else if (target) {
      if (
        this.hasMixin('Attacker') &&
        (this.hasMixin('PlayerActor') || target.hasMixin('PlayerActor'))
      ) {
        this.attack(target);
        return true;
      }
      return false;
    } else if (tile.isWalkable()) {
      this.setPosition(x, y, z);
      const items = this.getMap().getItemsAt(x, y, z);
      if (items) {
        if (items.length === 1) {
          Game.sendMessage(this, 'You see %s.', [items[0].describeA()]);
        } else {
          Game.sendMessage(this, 'There are several objects here.');
        }
      }
      return true;
    } else if (tile.isDiggable()) {
      if (this.hasMixin('Digger')) {
        this.dig(x, y, z, this._map);
        return true;
      }
      return false;
    }
    return false;
  }
}
