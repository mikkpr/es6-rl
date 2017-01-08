import ROT from 'rot-js';
import Map from './map';
import { Player } from './entities';
import Game from './index';
import { vsprintf } from 'sprintf-js';
import Builder from './builder';

const StartScreen = {
  enter: () => {},
  exit: () => {},
  render: (display) => {
    display.drawText(1, 1, '%c{yellow}Javascript Roguelike');
    display.drawText(1, 2, 'Press [Enter] to start!');
  },
  handleInput: (type, event) => {
    if (type === 'keydown') {
      if (event.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(PlayScreen);
      }
    }
  },
};

const PlayScreen = {
  _map: null,
  _player: null,
  _gameEnded: false,

  enter() {
    const width = 100;
    const height = 100;
    const depth = 5;

    const tiles = new Builder(width, height, depth).getTiles();
    this._player = new Player();

    this._map = new Map(tiles, this._player);
    this._map.getEngine().start();
  },

  move(dX, dY, dZ) {
    const newX = this._player.getX() + dX;
    const newY = this._player.getY() + dY;
    const newZ = this._player.getZ() + dZ;

    this._player.tryMove(newX, newY, newZ, this._map);
  },

  render(display) {
    const screenWidth = Game.getScreenWidth();
    const screenHeight = Game.getScreenHeight();

    const topLeftX = Math.min(Math.max(0, this._player.getX() - (screenWidth / 2)), this._map.getWidth() - screenWidth);
    const topLeftY = Math.min(Math.max(0, this._player.getY() - (screenHeight / 2)), this._map.getHeight() - screenHeight);

    // calculate FOV and set explored tiles
    const visibleCells = {};
    const map = this._map;
    const currentDepth = this._player.getZ();
    map.getFOV(currentDepth).compute(
      this._player.getX(),
      this._player.getY(),
      this._player.getSightRadius(),
      (x, y, radius, visibility) => {
        visibleCells[`${x},${y}`] = true;
        map.setExplored(x, y, currentDepth, true);
      }
    );

    // render map tiles and their contents
    for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
      for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
        if (map.getExplored(x, y, currentDepth)) {
          // first, try rendering the tile itself
          let glyph = this._map.getTile(x, y, currentDepth);
          let foreGround = glyph.getForeground();

          if (visibleCells[`${x},${y}`]) {
            // if tile is visible, try to render its contents instead, starting from items
            const items = map.getItemsAt(x, y, currentDepth);
            if (items) {
              glyph = items[items.length - 1];
            }

            // entities are always rendered on top of items
            if (map.getEntityAt(x, y, currentDepth)) {
              glyph = map.getEntityAt(x, y, currentDepth);
            }

            // update foreground
            foreGround = glyph.getForeground();
          } else {
            // render visited and invisible tiles in a darker color
            foreGround = '#333';
          }

          display.draw(
            x - topLeftX,
            y - topLeftY,
            glyph.getChar(),
            foreGround,
            glyph.getBackground()
          );
        }
      }
    }

    // draw messages
    const messages = this._player.getMessages();
    let messageY = 0;
    messages.forEach(message => {
      messageY += display.drawText(
        0,
        messageY,
        `%c{white}%b{black}${message}`
      );
    });

    // draw player stats
    let stats = vsprintf('HP: %d/%d EXP: %d', [
      this._player.getHP(),
      this._player.getMaxHP(),
      this._player.getExperience(),
    ]);
    stats = `%c{white}%b{black}${stats}`;
    display.drawText(0, screenHeight, stats);
  },

  handleInput(type, event) {
    if (this._gameEnded) {
      if (type === 'keydown' && event.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(LoseScreen);
      }
      return;
    }
    if (type === 'keydown') {
      // movement
      if (event.keyCode === ROT.VK_LEFT) {
        this.move(-1, 0, 0);
      } else if (event.keyCode === ROT.VK_RIGHT) {
        this.move(1, 0, 0);
      } else if (event.keyCode === ROT.VK_UP) {
        this.move(0, -1, 0);
      } else if (event.keyCode === ROT.VK_DOWN) {
        this.move(0, 1, 0);
      } else {
        return;
      }
      this._map.getEngine().unlock();
    } else if (type === 'keypress') {
      const keyChar = String.fromCharCode(event.charCode);
      if (keyChar === '>') {
        this.move(0, 0, 1);
      } else if (keyChar === '<') {
        this.move(0, 0, -1);
      } else {
        return;
      }
      this._map.getEngine().unlock();
    }
  },

  setGameEnded(ended) {
    this._gameEnded = ended;
  },

  exit() { },
};

const WinScreen = {
  enter: () => {},
  exit: () => {},
  render: (display) => {
    for (let i = 0; i < 22; i++) {
      // Generate random background colors
      const r = Math.round(Math.random() * 255);
      const g = Math.round(Math.random() * 255);
      const b = Math.round(Math.random() * 255);
      const background = ROT.Color.toRGB([r, g, b]);
      display.drawText(2, i + 1, `%b{${background}}You win!`);
    }
  },
  handleInput: () => { },
};

const LoseScreen = {
  enter: () => {},
  exit: () => {},
  render: (display) => {
    for (let i = 0; i < 22; i++) {
      display.drawText(2, i + 1, '%b{red}You lose! :(');
    }
  },
  handleInput: () => { },
};

export default {
  StartScreen,
  PlayScreen,
  WinScreen,
  LoseScreen,
};
