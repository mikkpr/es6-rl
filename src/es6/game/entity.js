import Glyph from './glyph';

export default class Entity extends Glyph {
  constructor(properties = {}) {
    super(properties);

    this._name = properties.name || '';
    this._x = properties.x || 0;
    this._y = properties.y || 0;
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

  getName() {
    return this._name;
  }

  getX() {
    return this._x;
  }

  getY() {
    return this._y;
  }

  setMap(map) {
    this._map = map;
  }

  getMap() {
    return this._map;
  }
}
