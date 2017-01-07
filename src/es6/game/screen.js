import ROT from 'rot-js';
import { NullTile, WallTile, FloorTile } from './tile';
import Map from './map';
import Entity from './entity';
import { PlayerTemplate } from './templates';

const StartScreen = {
  enter: () => console.log('Entered StartScreen'),
  exit: () => console.log('Exited StartScreen'),
  render: (display) => {
    display.drawText(1, 1, '%c{yellow}Javascript Roguelike');
    display.drawText(1, 2, 'Press [Enter] to start!');
  },
  handleInput: (type, event, game) => {
    if (type === 'keydown') {
      if (event.keyCode === ROT.VK_RETURN) {
        game.switchScreen(PlayScreen);
      }
    }
  },
};

const PlayScreen = {
  _map: null,
  _player: null,

  enter() {
    const mapWidth = 150;
    const mapHeight = 150;
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

  render(display, game) {
    const screenWidth = game.getScreenWidth();
    const screenHeight = game.getScreenHeight();

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
    const entities = this._map.getEntities();
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.getX() >= topLeftX && entity.getY() >= topLeftY && entity.getX() < topLeftX + screenWidth && entity.getY() < topLeftY + screenHeight) {
        display.draw(
          entity.getX() - topLeftX,
          entity.getY() - topLeftY,
          entity.getChar(),
          entity.getForeground(),
          entity.getBackground()
        );
      }
    }
  },

  handleInput(type, event, game) {
    if (type === 'keydown') {
      if (event.keyCode === ROT.VK_RETURN) {
        game.switchScreen(WinScreen);
      } else if (event.keyCode === ROT.VK_ESCAPE) {
        game.switchScreen(LoseScreen);
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
        game.refresh();
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
  handleInput: (type, event, game) => { },
};

const LoseScreen = {
  enter: () => console.log('Entered LoseScreen'),
  exit: () => console.log('Exited LoseScreen'),
  render: (display) => {
    for (let i = 0; i < 22; i++) {
      display.drawText(2, i + 1, '%b{red}You lose! :(');
    }
  },
  handleInput: (type, event, game) => { },
};

export default {
  StartScreen,
  PlayScreen,
  WinScreen,
  LoseScreen,
};
