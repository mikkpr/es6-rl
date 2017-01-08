import Glyph from './glyph';

export default class Item extends Glyph {
  constructor(properties = {}) {
    super(properties);
    this._name = properties.name || '';
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
}
