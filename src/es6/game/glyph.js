export default class Glyph {
  constructor(char, fg, bg) {
    this._char = char || ' ';
    this._fg = fg || 'white';
    this._bg = bg || 'black';
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
}
