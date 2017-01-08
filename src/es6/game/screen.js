import ROT from 'rot-js';
import Map from './map';
import Entity from './entity';
import { PlayerTemplate } from './templates';
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

  enter() {
    const width = 100;
    const height = 48;
    const depth = 2;

    const tiles = new Builder(width, height, depth).getTiles();
    this._player = new Entity(PlayerTemplate);
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

    const topLeftX = Math.min(
      Math.max(
        0,
        this._player.getX() - (screenWidth / 2)
      ),
      this._map.getWidth() - screenWidth
    );
    const topLeftY = Math.min(
      Math.max(
        0,
        this._player.getY() - (screenHeight / 2)
      ),
      this._map.getHeight() - screenHeight
    );

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

    // draw map tiles
    for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
      for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
        if (map.getExplored(x, y, currentDepth)) {
          const tile = this._map.getTile(x, y, currentDepth);
          const foreGround = visibleCells[`${x},${y}`] ? tile.getForeground() : 'darkGray';
          display.draw(
            x - topLeftX,
            y - topLeftY,
            tile.getChar(),
            foreGround,
            tile.getBackground()
          );
        }
      }
    }

    // draw entities
    const entities = this._map.getEntities();
    entities.forEach(entity => {
      if (
        entity.getX() >= topLeftX &&
        entity.getY() >= topLeftY &&
        entity.getX() < topLeftX + screenWidth &&
        entity.getY() < topLeftY + screenHeight &&
        entity.getZ() === this._player.getZ()
      ) {
        if (visibleCells[`${entity.getX()},${entity.getY()}`]) {
          display.draw(
            entity.getX() - topLeftX,
            entity.getY() - topLeftY,
            entity.getChar(),
            entity.getForeground(),
            entity.getBackground()
          );
        }
      }
    });

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
    let stats = vsprintf('HP: %d/%d ', [this._player.getHP(), this._player.getMaxHP()]);
    stats = `%c{white}%b{black}${stats}`;
    display.drawText(0, screenHeight, stats);
  },

  handleInput(type, event) {
    if (type === 'keydown') {
      if (event.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(WinScreen);
      } else if (event.keyCode === ROT.VK_ESCAPE) {
        Game.switchScreen(LoseScreen);
      } else {
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
      }
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
