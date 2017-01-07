import ROT from 'rot-js';
import Screen from './screen';

const displayDefaults = {
  width: 80,
  height: 24,
  fontSize: 15,
  forceSquareRatio: true,
};

const Game = {
  Screen,

  _display: null,
  _currentScreen: null,
  _screenWidth: displayDefaults.width,
  _screenHeight: displayDefaults.height,

  init(options) {
    this._display = new ROT.Display(Object.assign({}, displayDefaults, options));
    const _game = this;
    const bindEventToScreen = (event) => {
      window.addEventListener(event, (e) => {
        if (_game._currentScreen !== null) {
          _game._currentScreen.handleInput(event, e, _game);
        }
      });
    };
    ['keydown', 'keyup', 'keypress'].forEach(bindEventToScreen);
    return this;
  },

  refresh() {
    this._display.clear();
    this._currentScreen.render(this._display, this);
  },

  getDisplay() {
    return this._display;
  },

  getScreenWidth() {
    return this._screenWidth;
  },

  getScreenHeight() {
    return this._screenHeight;
  },

  switchScreen(screen) {
    if (this._currentScreen !== null) {
      this._currentScreen.exit();
    }

    this.getDisplay().clear();

    this._currentScreen = screen;

    if (!this._currentScreen !== null) {
      this._currentScreen.enter();
      this.refresh();
    }
  },
};

export default Game;
