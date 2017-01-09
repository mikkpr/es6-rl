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

class ItemListScreen {
  constructor(template) {
    this._caption = template.caption;
    this._okFunction = template.ok;
    this._isAcceptableFunction = template.isAcceptable || (x => x);
    this._canSelectItem = template.canSelect;
    this._canSelectMultipleItems = template.canSelectMultipleItems;
    this._hasNoItemOption = template.hasNoItemOption;
  }
  setup(player, items) {
    this._player = player;
    let count = 0;
    const isAcceptableFn = this._isAcceptableFunction;
    this._items = items.map(item => {
      if (isAcceptableFn(item)) {
        count++;
        return item;
      } else {
        return null;
      }
    });
    this._selectedIndices = {};
    return count;
  }
  render(display) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    display.drawText(0, 0, this._caption);
    if (this._hasNoItemOption) {
      display.drawText(0, 1, '0 - no item');
    }
    let row = 0;
    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i];
      if (item) {
        const letter = letters.substring(i, i + 1);
        const selectionState = (
          this._canSelectItem &&
          this._canSelectMultipleItems &&
          this._selectedIndices[i]
        ) ? '+' : '-';
        // Check if the item is worn or wielded
        let suffix = '';
        if (item === this._player.getArmor()) {
          suffix = ' (wearing)';
        } else if (item === this._player.getWeapon()) {
          suffix = ' (wielding)';
        }
        // Render at the correct row and add 2.
        display.drawText(0, 2 + row,  `${letter} ${selectionState} ${item.describe()}${suffix}`);
        row++;
      }
    }
  }
  handleInput(type, event) {
    if (type === 'keydown') {
      if (
        event.keyCode === ROT.VK_ESCAPE ||
        (event.keyCode === ROT.VK_RETURN && (
          !this._canSelectItem ||
          Object.keys(this._selectedIndices).length === 0
        ))
      ) {
        PlayScreen.setSubScreen(undefined);
      } else if (event.keyCode === ROT.VK_RETURN) {
        this.executeOKFunction();
      } else if (this._canSelectItem && this._hasNoItemOption && event.keyCode === ROT.VK_0) {
        this._selectedIndices = {};
        this.executeOkFunction();
      } else if (this._canSelectItem && event.keyCode >= ROT.VK_A && event.keyCode <= ROT.VK_Z) {
        const index = event.keyCode - ROT.VK_A;
        if (this._items[index]) {
          if (this._canSelectMultipleItems) {
            if (this._selectedIndices[index]) {
              delete this._selectedIndices[index];
            } else {
              this._selectedIndices[index] = true;
            }

            Game.refresh();
          } else {
            this._selectedIndices[index] = true;
            this.executeOKFunction();
          }
        }
      }
    }
  }
  executeOKFunction() {
    const selectedItems = {};
    Object.keys(this._selectedIndices).forEach(key => {
      selectedItems[key] = this._items[key];
    });

    PlayScreen.setSubScreen(undefined);

    if (this._okFunction(selectedItems)) {
      this._player.getMap().getEngine().unlock();
    }
  }
}

const InventoryScreen = new ItemListScreen({
  caption: 'Inventory',
  canSelect: false,
});

const PickupScreen = new ItemListScreen({
  caption: 'Choose the items you wish to pickup',
  canSelect: true,
  canSelectMultipleItems: true,

  ok(selectedItems) {
    if (!this._player.pickupItems(Object.keys(selectedItems))) {
      Game.sendMessage(this._player, 'Your inventory is full! Not all items were picked up.');
    }
    return true;
  },
});

const DropScreen = new ItemListScreen({
  caption: 'Choose the item you wish to drop',
    canSelect: true,
    canSelectMultipleItems: false,

    ok(selectedItems) {
      this._player.dropItem(Object.keys(selectedItems)[0]);
      return true;
    },
});

const EatScreen = new ItemListScreen({
  caption: 'Choose the item you wish to eat',
  canSelect: true,
  canSelectMultipleItems: false,
  isAcceptable: item => item && item.hasMixin('Edible'),
  ok(selectedItems) {
    const key = Object.keys(selectedItems)[0];
    const item = selectedItems[key];
    Game.sendMessage(this._player, 'You eat %s.', [item.describeThe()]);
    item.eat(this._player);
    if (!item.hasRemainingConsumptions()) {
      this._player.removeItem(key);
    }
    return true;
  },
});

const WieldScreen = new ItemListScreen({
  caption: 'Choose the item you wish to wield',
  canSelect: true,
  canSelectMultipleItems: false,
  hasNoItemOption: true,
  isAcceptable(item) {
    return item && item.hasMixin('Equippable') && item.isWieldable();
  },
  ok(selectedItems) {
    const keys = Object.keys(selectedItems);
    if (keys.length === 0) {
      this._player.unwield();
      Game.sendMessage(this._player, 'You are empty handed.');
    } else {
      const item = selectedItems[keys[0]];
      this._player.unequip(item);
      this._player.wield(item);
      Game.sendMessage(this._player, 'You are wielding %s.', [item.describeA()]);
    }
    return true;
  },
});

const WearScreen = new ItemListScreen({
  caption: 'Choose the item you wish to wear',
  canSelect: true,
  canSelectMultipleItems: false,
  hasNoItemOption: true,
  isAcceptable(item) {
    return item && item.hasMixin('Equippable') && item.isWearable();
  },
  ok(selectedItems) {
    const keys = Object.keys(selectedItems);
    if (keys.length === 0) {
      this._player.unwield();
      Game.sendMessage(this._player, 'You are not wearing anthing.');
    } else {
      const item = selectedItems[keys[0]];
      this._player.unequip(item);
      this._player.wear(item);
      Game.sendMessage(this._player, 'You are wearing %s.', [item.describeA()]);
    }
    return true;
  },
});

const PlayScreen = {
  _map: null,
  _player: null,
  _gameEnded: false,
  _subScreen: null,

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
    if (this._subScreen) {
      this._subScreen.render(display);
      return;
    }

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

    // draw hunger state
    const hungerState = this._player.getHungerState();
    display.drawText(screenWidth - hungerState.length, screenHeight, hungerState);
  },

  handleInput(type, event) {
    if (this._gameEnded) {
      if (type === 'keydown' && event.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(LoseScreen);
      }
      return;
    }
    if (this._subScreen) {
      this._subScreen.handleInput(type, event);
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
      } else if (event.keyCode === ROT.VK_I) {
        // Show the inventory screen
        this.showItemsSubScreen(
          InventoryScreen,
          this._player.getItems(),
          'You are not carrying anything.'
        );
        return;
      } else if (event.keyCode === ROT.VK_D) {
        // Show the drop screen
        this.showItemsSubScreen(
          DropScreen,
          this._player.getItems(),
          'You have nothing to drop.'
        );
      } else if (event.keyCode === ROT.VK_E) {
        // Show the drop screen
        this.showItemsSubScreen(
          EatScreen,
          this._player.getItems(),
          'You have nothing to eat.'
        );
        return;
      } else if (event.keyCode === ROT.VK_W) {
        if (event.shiftKey) {
          // Show the wear screen
          this.showItemsSubScreen(
            WearScreen,
            this._player.getItems(),
            'You have nothing to wear.'
          );
        } else {
          // Show the wield screen
          this.showItemsSubScreen(
            WieldScreen,
            this._player.getItems(),
            'You have nothing to wield.'
          );
        }
        return;
      } else if (event.keyCode === ROT.VK_COMMA) {
        const items = this._map.getItemsAt(this._player.getX(), this._player.getY(), this._player.getZ());
        // If there is only one item, directly pick it up
        if (items && items.length === 1) {
          const item = items[0];
          if (this._player.pickupItems([0])) {
            Game.sendMessage(this._player, 'You pick up %s.', [item.describeA()]);
          } else {
            Game.sendMessage(this._player, 'Your inventory is full! Nothing was picked up.');
          }
        } else {
          this.showItemsSubScreen(
            PickupScreen,
            items,
            'There is nothing here to pick up.'
          );
        }
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

  showItemsSubScreen(subScreen, items, emptyMessage) {
    if (items && subScreen.setup(this._player, items) > 0) {
      this.setSubScreen(subScreen);
    } else {
      Game.sendMessage(this._player, emptyMessage);
      Game.refresh();
    }
  },

  setGameEnded(ended) {
    this._gameEnded = ended;
  },

  setSubScreen(screen) {
    this._subScreen = screen;
    Game.refresh();
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
