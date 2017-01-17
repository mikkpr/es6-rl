import ROT from 'rot-js';
import Cave from './maps/cave';
import { Player } from './entities';
import Game from './index';
import { vsprintf } from 'sprintf-js';
import Builder from './builder';
import { getLine } from './geometry';
import { NullTile } from './tile';

export const StartScreen = {
  enter: () => {},
  exit: () => {},
  render: (display) => {
    display.drawText(1, 1, '%c{yellow}Javascript Roguelike');
    display.drawText(1, 2, 'Press [Enter] to start!');
  },
  handleInput: (type, event) => {
    if (type === 'keydown') {
      if (event.keyCode === ROT.VK_RETURN) {
        Game.switchScreen('PlayScreen');
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
        Game.getScreen('PlayScreen').setSubScreen(undefined);
      } else if (event.keyCode === ROT.VK_RETURN) {
        this.executeOKFunction();
      } else if (this._canSelectItem && this._hasNoItemOption && event.keyCode === ROT.VK_0) {
        this._selectedIndices = {};
        this.executeOKFunction();
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

    Game.getScreen('PlayScreen').setSubScreen(undefined);

    if (this._okFunction(selectedItems)) {
      this._player.getMap().getEngine().unlock();
    }
  }
}

export const InventoryScreen = new ItemListScreen({
  caption: 'Inventory',
  canSelect: false,
});

export const PickupScreen = new ItemListScreen({
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

export const DropScreen = new ItemListScreen({
  caption: 'Choose the item you wish to drop',
    canSelect: true,
    canSelectMultipleItems: false,

    ok(selectedItems) {
      this._player.dropItem(Object.keys(selectedItems)[0]);
      return true;
    },
});

export const EatScreen = new ItemListScreen({
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

export const WieldScreen = new ItemListScreen({
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

export const WearScreen = new ItemListScreen({
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

export const ExamineScreen = new ItemListScreen({
  caption: 'Choose the item you wish to examine',
  canSelect: true,
  canSelectMultipleItems: false,
  isAcceptable() {
    return true;
  },
  ok(selectedItems) {
    const keys = Object.keys(selectedItems);
    if (keys.length > 0) {
      const item = selectedItems[keys[0]];
      Game.sendMessage(this._player, "It's %s (%s).", [
        item.describeA(false),
        item.details(),
      ]);
    }
    return true;
  },
});

class TargetBasedScreen {
  constructor(template = {}) {
    this._isAcceptableFunction = template.okFunction || (() => false);
    this._captionFunction = template.captionFunction || (() => '');
  }

  setup(player, startX, startY, offsetX, offsetY) {
    this._player = player;
    // store original position and subtract offset
    this._startX = startX - offsetX;
    this._startY = startY - offsetY;

    // store current cursor position
    this._cursorX = this._startX;
    this._cursorY = this._startY;

    // store map offsets
    this._offsetX = offsetX;
    this._offsetY = offsetY;

    // cache the FOV
    const visibleCells = {};
    this._player.getMap().getFOV(this._player.getZ()).compute(
      this._player.getX(),
      this._player.getY(),
      this._player.getSightRadius(),
      (x, y) => {
        visibleCells[`${x},${y}`] = true;
      }
    );
    this._visibleCells = visibleCells;
  }

  render(display) {
    Game.getScreen('PlayScreen').renderTiles.call(Game.getScreen('PlayScreen'), display);

    const points = getLine(this._startX, this._startY, this._cursorX, this._cursorY);
    points.forEach(p => display.drawText(p.x, p.y, '%c{magenta}*'));

    display.drawText(0, Game.getScreenHeight() - 1, this._captionFunction(this._cursorX + this._offsetX, this._cursorY + this._offsetY));
  }

  handleInput(type, event) {
    if (type === 'keydown') {
      if (event.keyCode === ROT.VK_LEFT) {
        this.moveCursor(-1, 0);
      } else if (event.keyCode === ROT.VK_RIGHT) {
        this.moveCursor(1, 0);
      } else if (event.keyCode === ROT.VK_UP) {
        this.moveCursor(0, -1);
      } else if (event.keyCode === ROT.VK_DOWN) {
        this.moveCursor(0, 1);
      } else if (event.keyCode === ROT.VK_ESCAPE) {
        Game.getScreen('PlayScreen').setSubScreen(undefined);
      } else if (event.keyCode === ROT.VK_RETURN) {
        this.executeOKFunction();
      }
    }
    Game.refresh();
  }

  moveCursor(dx, dy) {
    this._cursorX = Math.max(0, Math.min(this._cursorX + dx, Game.getScreenWidth()));
    this._cursorY = Math.max(0, Math.min(this._cursorY + dy, Game.getScreenHeight()));
  }

  executeOKFunction() {
    Game.getScreen('PlayScreen').setSubScreen(undefined);
    if (this._okFunction(this._cursorX + this._offsetX, this._cursorY + this._offsetY)) {
      this._player.getMap().getEngine().unlock();
    }
  }
}

export const LookScreen = new TargetBasedScreen({
  captionFunction(x, y) {
    const z = this._player.getZ();
    const map = this._player.getMap();

    if (map.getExplored(x, y, z)) {
      if (this._visibleCells[`${x},${y}`]) {
        const items = map.getItemsAt(x, y, z);

        if (items) {
          const item = items[items.length - 1];
          return String.format(
            '%s - %s (%s)',
            item.getRepresentation(),
            item.describeA(true),
            item.details()
          );
        } else if (map.getEntityAt(x, y, z)) {
          const entity = map.getEntityAt(x, y, z);
          return String.format(
            '%s - %s (%s)',
            entity.getRepresentation(),
            entity.describeA(true),
            entity.details()
          );
        }
      }

      return String.format(
        '%s - %s',
        map.getTile(x, y, z).getRepresentation(),
        map.getTile(x, y, z).getDescription()
      );
    } else {
      return String.format(
        '%s - %s',
        NullTile.getRepresentation(),
        NullTile.getDescription()
      );
    }
  },
});

export const HelpScreen = {
  render(display) {
    const text = 'help';
    const border = '---------------';
    let y = 0;
    display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
    display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, border);
    display.drawText(0, y++, 'The villagers have been complaining of a terrible stench coming from the cave.');
    display.drawText(0, y++, 'Find the source of this smell and get rid of it!');
    y += 3;
    display.drawText(0, y++, '[,] to pick up items');
    display.drawText(0, y++, '[d] to drop items');
    display.drawText(0, y++, '[e] to eat items');
    display.drawText(0, y++, '[w] to wield items');
    display.drawText(0, y++, '[W] to wield items');
    display.drawText(0, y++, '[x] to examine items');
    display.drawText(0, y++, '[;] to look around you');
    display.drawText(0, y++, '[?] to show this help screen');
    y += 3;
    const anyText = '--- press any key to continue ---';
    display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, anyText);
  },

  handleInput() {
    Game.getScreen('PlayScreen').setSubScreen(null);
  },
};

export const GainStatScreen = {
  setup(entity) {
    this._entity = entity;
    this._options = entity.getStatOptions();
  },
  render(display) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    display.drawText(0, 0, 'Choose a stat to increase: ');

    // Iterate through each of our options
    for (let i = 0; i < this._options.length; i++) {
      const x = 0;
      const y = 2 + i;
      const text = `${letters.substring(i, i + 1)} - ${this._options[i][0]}`;
      display.drawText(x, y, text);
    }

    // Render remaining stat points
    const text = `Remaining points: ${this._entity.getStatPoints()}`;
    display.drawText(0, 4 + this._options.length, text);
  },
  handleInput(type, event) {
    if (type === 'keydown') {
      // If a letter was pressed, check if it matches to a valid option.
      if (event.keyCode >= ROT.VK_A && event.keyCode <= ROT.VK_Z) {
        // Check if it maps to a valid item by subtracting 'a' from the character
        // to know what letter of the alphabet we used.
        const index = event.keyCode - ROT.VK_A;
        if (this._options[index]) {
          // Call the stat increasing function
          this._options[index][1].call(this._entity);
          // Decrease stat points
          this._entity.setStatPoints(this._entity.getStatPoints() - 1);
          // If we have no stat points left, exit the screen, else refresh
          if (this._entity.getStatPoints() === 0) {
            Game.getScreen('PlayScreen').setSubScreen(undefined);
          } else {
            Game.refresh();
          }
        }
      }
    }
  },
};

export const PlayScreen = {
  _player: null,
  _gameEnded: false,
  _subScreen: null,

  enter() {
    const width = 100;
    const height = 100;
    const depth = 5;

    this._player = new Player();
    const tiles = new Builder(width, height, depth).getTiles();

    const map = new Cave(tiles, this._player);
    map.getEngine().start();
  },

  move(dX, dY, dZ) {
    const newX = this._player.getX() + dX;
    const newY = this._player.getY() + dY;
    const newZ = this._player.getZ() + dZ;

    this._player.tryMove(newX, newY, newZ);
  },

  render(display) {
    if (this._subScreen) {
      this._subScreen.render(display);
      return;
    }

    const screenWidth = Game.getScreenWidth();
    const screenHeight = Game.getScreenHeight();

    this.renderTiles(display);

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
    const stats = vsprintf('HP:%d/%d ATK:%d DEF:%d', [
      this._player.getHP(),
      this._player.getMaxHP(),
      this._player.getAttackValue(),
      this._player.getDefenseValue(),
    ]);
    const stats2 = vsprintf('L:%d EXP:%d', [
      this._player.getLevel(),
      this._player.getExperience(),
    ]);
    display.drawText(0, screenHeight, `%c{white}%b{black}${stats}`);
    display.drawText(screenWidth - stats2.length, screenHeight, `%c{white}%b{black}${stats2}`);

    // draw hunger state
    const hungerState = this._player.getHungerState();
    display.drawText(screenWidth - hungerState.length, screenHeight - 1, hungerState);
  },

  getScreenOffsets() {
    const topLeftX = Math.min(Math.max(0, this._player.getX() - (Game.getScreenWidth() / 2)), this._player.getMap().getWidth() - Game.getScreenWidth());
    const topLeftY = Math.min(Math.max(0, this._player.getY() - (Game.getScreenHeight() / 2)), this._player.getMap().getHeight() - Game.getScreenHeight());

    return {
      x: topLeftX,
      y: topLeftY,
    };
  },

  renderTiles(display) {
    const screenWidth = Game.getScreenWidth();
    const screenHeight = Game.getScreenHeight();
    const offsets = this.getScreenOffsets();
    const { x: topLeftX, y: topLeftY } = offsets;

    // calculate FOV and set explored tiles
    const visibleCells = {};
    const map = this._player.getMap();
    const currentDepth = this._player.getZ();
    map.getFOV(currentDepth).compute(
      this._player.getX(),
      this._player.getY(),
      this._player.getSightRadius(),
      (x, y) => {
        visibleCells[`${x},${y}`] = true;
        map.setExplored(x, y, currentDepth, true);
      }
    );

    // render map tiles and their contents
    for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
      for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
        if (map.getExplored(x, y, currentDepth)) {
          // first, try rendering the tile itself
          let glyph = map.getTile(x, y, currentDepth);
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
  },

  handleInput(type, event) {
    const offsets = this.getScreenOffsets();

    if (this._gameEnded) {
      if (type === 'keydown' && event.keyCode === ROT.VK_RETURN) {
        Game.switchScreen('LoseScreen');
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
      } else if (event.keyCode === ROT.VK_X) {
        this.showItemsSubScreen(Game.getScreen('ExamineScreen'), this._player.getItems(), 'You have nothing to examine.');
        return;
      } else if (event.keyCode === ROT.VK_COMMA) {
        const items = this._player.getMap().getItemsAt(this._player.getX(), this._player.getY(), this._player.getZ());
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
      this._player.getMap().getEngine().unlock();
    } else if (type === 'keypress') {
      const keyChar = String.fromCharCode(event.charCode);
      if (keyChar === '>') {
        this.move(0, 0, 1);
      } else if (keyChar === '<') {
        this.move(0, 0, -1);
      } else if (keyChar === ';') {
        // Setup the look screen.
        Game.getScreen('LookScreen').setup(
          this._player,
          this._player.getX(),
          this._player.getY(),
          offsets.x,
          offsets.y
        );
        this.setSubScreen(Game.getScreen('LookScreen'));
        return;
      } else if (keyChar === '?') {
        // Setup the look screen.
        this.setSubScreen(Game.getScreen('HelpScreen'));
        return;
      } else {
        return;
      }
      this._player.getMap().getEngine().unlock();
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

export const WinScreen = {
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

export const LoseScreen = {
  enter: () => {},
  exit: () => {},
  render: (display) => {
    for (let i = 0; i < 22; i++) {
      display.drawText(2, i + 1, '%b{red}You lose! :(');
    }
  },
  handleInput: () => { },
};
