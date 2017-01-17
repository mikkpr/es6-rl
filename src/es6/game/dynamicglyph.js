import Glyph from './glyph';

export default class DynamicGlyph extends Glyph {
  constructor(properties = {}) {
    super(properties);

    this._name = properties.name || '';

    this._attachedMixins = {};
    this._attachedMixinGroups = {};

    this._listeners = {};

    const mixins = properties.mixins || [];
    mixins.forEach(mixin => {
      const keys = Object.keys(mixin);

      for (let k = 0; k < keys.length; k++) {
        const key = keys[k];

        if (key !== 'init' && key !== 'name' && key !== 'groupName' && !this.hasOwnProperty(key)) {
          this[key] = mixin[key];
        }
      }

      this._attachedMixins[mixin.name] = true;
      if (mixin.groupName) {
        this._attachedMixinGroups[mixin.groupName] = true;
      }

      if (mixin.listeners) {
        Object.keys(mixin.listeners).forEach(event => {
          if (!this._listeners[event]) {
            this._listeners[event] = [];
          }

          this._listeners[event].push(mixin.listeners[event]);
        });
      }
    });

    // init mixin
    mixins.forEach(mixin => {
      if (mixin.init) {
        mixin.init.call(this, properties);
      }
    });
  }

  raiseEvent(event, ...args) {
    if (!this._listeners[event]) {
      return [];
    }

    const results = [];
    this._listeners[event].forEach(callback => {
      results.push(callback.apply(this, args));
    });
    return results;
  }

  details() {
    const details = [];
    const detailGroups = this.raiseEvent('details');
    // Iterate through each return value, grabbing the details from the arrays.
    if (detailGroups) {
      for (let i = 0; i < detailGroups.length; i++) {
        if (detailGroups[i]) {
          for (let j = 0; j < detailGroups[i].length; j++) {
            details.push(`${detailGroups[i][j].key}: ${detailGroups[i][j].value}`);
          }
        }
      }
    }
    return details.join(', ');
  }

  hasMixin(obj) {
    const mixin = (typeof obj === 'object') ? obj.name : obj;
    return this._attachedMixinGroups[mixin] || this._attachedMixins[mixin];
  }

  setName(name) {
    this._name = name;
  }

  getName() {
    return this._name;
  }

  describe() {
    return this._name;
  }

  describeA(capitalize) {
    const prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
    const string = this.describe();
    const firstLetter = string.charAt(0).toLowerCase();
    const prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
    return `${prefixes[prefix]} ${string}`;
  }

  describeThe(capitalize) {
    const prefix = capitalize ? 'The' : 'the';
    return `${prefix} ${this.describe()}`;
  }
}
