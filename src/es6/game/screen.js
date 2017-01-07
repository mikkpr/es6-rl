import ROT from 'rot-js';
import { NullTile, WallTile, FloorTile } from './tile';
import Map from './map';
import Entity from './entity';
import { PlayerTemplate } from './templates';
import Game from './index';
import { vsprintf } from 'sprintf-js';

const StartScreen = {
  enter: () => console.log('Entered StartScreen'),
  exit: () => console.log('Exited StartScreen'),
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
    const mapWidth = 100;
    const mapHeight = 48;
    const generator = new ROT.Map.Cellular(mapWidth, mapHeight);
    const totalIterations = 3;
    const map = [];
    for (let x = 0; x < mapWidth; x++) {
      map.push([]);
      for (let y = 0; y < mapHeight; y++) {
        map[x].push(NullTile);
      }
    }
    generator.randomize(0.5);
    // Iteratively smoothen the map
    for (let i = 0; i < totalIterations - 1; i++) {
      generator.create();
    }
    // Smoothen it one last time and then update our map
    generator.create((x, y, v) => {
      if (v === 1) {
        map[x][y] = FloorTile;
      } else {
        map[x][y] = WallTile;
      }
    });

    this._player = new Entity(PlayerTemplate);
    this._map = new Map(map, this._player);
    this._map.getEngine().start();
  },

  move(dX, dY) {
    const newX = this._player.getX() + dX;
    const newY = this._player.getY() + dY;

    this._player.tryMove(newX, newY, this._map);
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

    // draw map tiles
    for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
      for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
        const tile = this._map.getTile(x, y);
        display.draw(
          x - topLeftX,
          y - topLeftY,
          tile.getChar(),
          tile.getForeground(),
          tile.getBackground()
        );
      }
    }

    // draw entities
    const entities = this._map.getEntities();
    entities.forEach(entity => {
      if (entity.getX() >= topLeftX && entity.getY() >= topLeftY && entity.getX() < topLeftX + screenWidth && entity.getY() < topLeftY + screenHeight) {
        display.draw(
          entity.getX() - topLeftX,
          entity.getY() - topLeftY,
          entity.getChar(),
          entity.getForeground(),
          entity.getBackground()
        );
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
          this.move(-1, 0);
        } else if (event.keyCode === ROT.VK_RIGHT) {
          this.move(1, 0);
        } else if (event.keyCode === ROT.VK_UP) {
          this.move(0, -1);
        } else if (event.keyCode === ROT.VK_DOWN) {
          this.move(0, 1);
        }
        this._map.getEngine().unlock();
      }
    }
  },

  exit() {
    console.log('Exited PlayScreen');
  },
};

const WinScreen = {
  enter: () => console.log('Entered WinScreen'),
  exit: () => console.log('Exited WinScreen'),
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
  handleInput: (type, event) => { },
};

const LoseScreen = {
  enter: () => console.log('Entered LoseScreen'),
  exit: () => console.log('Exited LoseScreen'),
  render: (display) => {
    for (let i = 0; i < 22; i++) {
      display.drawText(2, i + 1, '%b{red}You lose! :(');
    }
  },
  handleInput: (type, event) => { },
};

export default {
  StartScreen,
  PlayScreen,
  WinScreen,
  LoseScreen,
};
