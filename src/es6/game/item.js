import Glyph from './glyph';

export default class Item extends Glyph {
  constructor(properties = {}) {
    super(properties);
    this._name = properties.name || '';
  }
}
