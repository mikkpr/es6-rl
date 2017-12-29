const GlyphComponent = Base =>
  class extends Base {
    constructor() {
      super(...arguments);

      this._char = '';
      this._fg = 'white';
      this._bg = 'black';
    }

    get char() {
      return this._char;
    }
    set char(v) {
      this._char = v;
    }

    get fg() {
      return this._fg;
    }
    set fg(v) {
      this._fg = v;
    }

    get bg() {
      return this._bg;
    }
    set bg(v) {
      this._bg = v;
    }
  };
  
export default GlyphComponent;
