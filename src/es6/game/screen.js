import ROT from 'rot-js';
import { NullTile, WallTile, FloorTile } from './tile';
import Map from './map';

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
  _centerX: 0,
  _centerY: 0,

  enter() {
    const mapWidth = 250;
    const mapHeight = 250;
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
    // Create our map from the tiles
    this._map = new Map(map);
  },

  move(dX, dY) {
    this._centerX = Math.max(
      0,
      Math.min(
        this._map.getWidth() - 1,
        this._centerX + dX
      )
    );
    this._centerY = Math.max(
      0,
      Math.min(
        this._map.getHeight() - 1,
        this._centerY + dY
      )
    );
  },

  exit() {
    console.log('Exited PlayScreen');
  },

  render(display, game) {
    const screenWidth = game.getScreenWidth();
    const screenHeight = game.getScreenHeight();

    const topLeftX = Math.min(
      Math.max(
        0,
        this._centerX - (screenWidth / 2)
      ),
      this._map.getWidth() - screenWidth
    );
    const topLeftY = Math.min(
      Math.max(
        0,
        this._centerY - (screenHeight / 2)
      ),
      this._map.getHeight() - screenHeight
    );

    for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
      for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
        const glyph = this._map.getTile(x, y).getGlyph();
        display.draw(
          x - topLeftX,
          y - topLeftY,
          glyph.getChar(),
          glyph.getForeground(),
          glyph.getBackground()
        );
      }
    }
    display.draw(
      this._centerX - topLeftX,
      this._centerY - topLeftY,
      '@',
      'white',
      'black'
    );
  },

  handleInput(type, event, game) {
    if (type === 'keydown') {
      if (event.keyCode === ROT.VK_RETURN) {
        game.switchScreen(WinScreen);
      } else if (event.keyCode === ROT.VK_ESCAPE) {
        game.switchScreen(LoseScreen);
      }

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
    }
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
