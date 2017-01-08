import Game from './index';
import Glyph from './glyph';
import { StairsUpTile, StairsDownTile } from './tile';

export default class Entity extends Glyph {
  constructor(properties = {}) {
    super(properties);

    this._name = properties.name || '';
    this._x = properties.x || 0;
    this._y = properties.y || 0;
    this._z = properties.z || 0;
    this._map = null;

    this._attachedMixins = {};
    this._attachedMixinGroups = {};
    const mixins = properties.mixins || [];
    for (let i = 0; i < mixins.length; i++) {
      const mixin = mixins[i];
      const keys = Object.keys(mixin);

      for (let k = 0; k < keys.length; k++) {
        const key = keys[k];

        if (key !== 'init' && key !== 'name' && key !== 'groupName' && !this.hasOwnProperty(key)) {
          this[key] = mixin[key];
        }

        this._attachedMixins[mixin.name] = true;
        if (mixin.groupName) {
          this._attachedMixinGroups[mixin.groupName] = true;
        }

        if (mixin.init) {
          mixin.init.call(this, properties);
        }
      }
    }
  }

  hasMixin(obj) {
    const mixin = (typeof obj === 'object') ? obj.name : obj;
    return this._attachedMixinGroups[mixin] || this._attachedMixins[mixin];
  }

  setName(name) {
    this._name = name;
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

  getName() {
    return this._name;
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

  tryMove(x, y, z, map) {
    const tile = map.getTile(x, y, this.getZ());
    const target = map.getEntityAt(x, y, this.getZ());

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
      return true;
    } else if (tile.isDiggable()) {
      if (this.hasMixin('Digger')) {
        this.dig(x, y, z, map);
        return true;
      }
      return false;
    }
    return false;
  }
}
