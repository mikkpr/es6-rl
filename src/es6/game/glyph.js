export default class Glyph {
  constructor(properties = {}) {
    this._char = properties.char || ' ';
    this._fg = properties.fg || 'white';
    this._bg = properties.bg || 'black';
  }

  getChar() {
    return this._char;
  }

  getBackground() {
    return this._bg;
  }

  getForeground() {
    return this._fg;
  }

  getRepresentation() {
    return `%c{${this._fg}}%b{${this._bg}}${this._char}%c{white}%b{black}`;
  }
}
