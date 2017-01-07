import ROT from 'rot-js';
import { vsprintf } from 'sprintf-js';

import Screen from './screen';
import { MessageRecipient } from './mixins';

const displayDefaults = {
  width: 80,
  height: 24,
  fontSize: 15,
  forceSquareRatio: true,
};

export const Game = {
  Screen,

  _display: null,
  _currentScreen: null,
  _screenWidth: displayDefaults.width,
  _screenHeight: displayDefaults.height,

  init(options) {
    this._display = new ROT.Display(Object.assign({}, displayDefaults, options, { height: this._screenHeight + 1 }));
    const _game = this;
    const bindEventToScreen = (event) => {
      window.addEventListener(event, (e) => {
        if (_game._currentScreen !== null) {
          _game._currentScreen.handleInput(event, e);
        }
      });
    };
    ['keydown', 'keyup', 'keypress'].forEach(bindEventToScreen);
    return this;
  },

  refresh() {
    this._display.clear();
    this._currentScreen.render(this._display);
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
  sendMessage(recipient, message, args) {
    let msg;
    if (recipient.hasMixin(MessageRecipient)) {
      if (args) {
        msg = vsprintf(message, args);
      } else {
        msg = message;
      }
      recipient.receiveMessage(msg);
    }
  },
  sendMessageNearby(map, x, y, message, args) {
    let msg = message;
    if (args) {
      msg = vsprintf(message, args);
    }

    const entities = map.getEntitiesWithinRadius(x, y, 5);
    entities.forEach(e => {
      if (e.hasMixin(MessageRecipient)) {
        e.receiveMessage(msg);
      }
    });
  },
};

export default Game.init();
