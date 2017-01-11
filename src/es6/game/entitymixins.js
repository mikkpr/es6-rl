import EntityRepository from './entities';
import ItemRepository from './items';
import ROT from 'rot-js';

import Game from './index';

export const PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',

  act() {
    if (this._acting) {
      return;
    }
    this._acting = true;
    this.addTurnHunger();

    // detect if game is over
    if (!this._alive) {
      Game.Screen.PlayScreen.setGameEnded(true);
      Game.sendMessage(this, 'Press [ENTER] to continue.');
    }
    Game.refresh();
    this.getMap().getEngine().lock();
    this.clearMessages();

    this._acting = false;
  },
};

export const FungusActor = {
  name: 'FungusActor',
  groupName: 'Actor',
  init() {
    this._growthsRemaining = 5;
  },
  act() {
    if (this._growthsRemaining > 0) {
      if (Math.random() <= 0.02) {
        const xOffset = Math.floor(Math.random() * 3) - 1;
        const yOffset = Math.floor(Math.random() * 3) - 1;

        if (xOffset !== 0 || yOffset !== 0) {
          if (this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset, this.getZ())) {
            const entity = EntityRepository.create('fungus');
            entity.setPosition(this.getX() + xOffset, this.getY() + yOffset, this.getZ());
            this.getMap().addEntity(entity);
            this._growthsRemaining--;

            Game.sendMessageNearby(this.getMap(), entity.getX(), entity.getY(), entity.getZ(), 'The fungus is spreading!');
          }
        }
      }
    }
  },
};

export const Destructible = {
  name: 'Destructible',
  init(template) {
    this._maxHP = template.maxHP || 10;
    this._HP = template.HP || this._maxHP;

    this._experienceValue = template.experienceValue || 0;

    this._defenseValue = template.defenseValue || 0;
  },
  getHP() {
    return this._HP;
  },
  getMaxHP() {
    return this._maxHP;
  },
  getDefenseValue() {
    let modifier = 0;
    // If we can equip items, then have to take into
    // consideration weapon and armor
    if (this.hasMixin('Equipper')) {
      if (this.getWeapon()) {
        modifier += this.getWeapon().getDefenseValue();
      }
      if (this.getArmor()) {
        modifier += this.getArmor().getDefenseValue();
      }
    }
    return this._defenseValue + modifier;
  },
  takeDamage(attacker, damage) {
    this._HP -= damage;

    if (this._HP <= 0) {
      Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
      if (this.hasMixin('CorpseDropper')) {
        this.tryDropCorpse();
      }
      if (attacker.hasMixin('Experience')) {
        attacker.addExperience(this._experienceValue);
      }
      this.kill();
    }
  },
};

export const Digger = {
  name: 'SimpleDigger',
  groupName: 'Digger',
  dig(x, y, z, map) {
    map.dig(x, y, z);
  },
};

export const Attacker = {
  name: 'Attacker',
  groupName: 'Attacker',
  init(template) {
    this._attackValue = template.attackValue || 1;
  },
  getAttackValue() {
    let modifier = 0;
    // If we can equip items, then have to take into
    // consideration weapon and armor
    if (this.hasMixin('Equipper')) {
      if (this.getWeapon()) {
        modifier += this.getWeapon().getAttackValue();
      }
      if (this.getArmor()) {
        modifier += this.getArmor().getAttackValue();
      }
    }
    return this._attackValue + modifier;
  },
  attack(target) {
    if (target.hasMixin('Destructible')) {
      const attack = this.getAttackValue();
      const defense = target.getDefenseValue();
      const max = Math.max(0, attack - defense);
      const damage = 1 + Math.floor(Math.random() * max);

      Game.sendMessage(this, 'You strike the %s for %d damage!', [target.getName(), damage]);
      Game.sendMessage(target, 'The %s strikes you for %d damage!', [this.getName(), damage]);

      target.takeDamage(this, damage);
    }
  },
};

export const MessageRecipient = {
  name: 'MessageRecipient',
  init() {
    this._messages = [];
  },
  receiveMessage(message) {
    this._messages.push(message);
  },
  getMessages() {
    return this._messages;
  },
  clearMessages() {
    this._messages = [];
  },
};

export const Sight = {
  name: 'Sight',
  group: 'Sight',
  init(template) {
    this._sightRadius = template.sightRadius || 5;
  },
  getSightRadius() {
    return this._sightRadius;
  },
  canSee(entity) {
    // If not on the same map or on different floors, then exit early
    if (!entity || this._map !== entity.getMap() || this._z !== entity.getZ()) {
      return false;
    }

    const otherX = entity.getX();
    const otherY = entity.getY();

    // If we're not in a square field of view, then we won't be in a real
    // field of view either.
    if ((otherX - this._x) * (otherX - this._x) +
      (otherY - this._y) * (otherY - this._y) >
      this._sightRadius * this._sightRadius) {
      return false;
    }

    // Compute the FOV and check if the coordinates are in there.
    let found = false;
    this.getMap().getFOV(this.getZ()).compute(
      this.getX(),
      this.getY(),
      this.getSightRadius(),
      (x, y) => {
        if (x === otherX && y === otherY) {
          found = true;
        }
      }
    );
    return found;
  },
};

export const TaskActor = {
  name: 'TaskActor',
  groupName: 'Actor',
  init(template) {
    this._tasks = template.tasks || ['wander'];
  },
  act() {
    // Iterate through all our tasks
    for (let i = 0; i < this._tasks.length; i++) {
      const task = this._tasks[i];
      if (this.canDoTask(task)) {
        // If we can perform the task, execute the function for it.
        this[task]();
        return;
      }
    }
  },
  canDoTask(task) {
    if (task === 'hunt') {
      return this.hasMixin('Sight') && this.canSee(this.getMap().getPlayer());
    } else if (task === 'wander') {
      return true;
    } else {
      throw new Error(`Tried to perform undefined task ${task}`);
    }
  },
  hunt() {
    const player = this.getMap().getPlayer();

    // If we are adjacent to the player, then attack instead of hunting.
    const offsets = (
      Math.abs(player.getX() - this.getX()) +
      Math.abs(player.getY() - this.getY())
    );
    if (offsets === 1) {
      if (this.hasMixin('Attacker')) {
        this.attack(player);
        return;
      }
    }

    // Generate the path and move to the first tile.
    const source = this;
    const z = source.getZ();
    const path = new ROT.Path.AStar(
      player.getX(),
      player.getY(),
      (x, y) => {
        // If an entity is present at the tile, can't move there.
        const entity = source.getMap().getEntityAt(x, y, z);
        if (entity && entity !== player && entity !== source) {
          return false;
        }
        return source.getMap().getTile(x, y, z).isWalkable();
      },
      { topology: 4 }
    );
    // Once we've gotten the path, we want to move to the second cell that is
    // passed in the callback (the first is the entity's strting point)
    let count = 0;
    path.compute(
      source.getX(),
      source.getY(),
      (x, y) => {
        if (count == 1) {
          source.tryMove(x, y, z);
        }
        count++;
      }
    );
  },
  wander() {
    // Flip coin to determine if moving by 1 in the positive or negative direction
    const moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
    // Flip coin to determine if moving in x direction or y direction
    if (Math.round(Math.random()) === 1) {
      this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
    } else {
      this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
    }
  },
};

export const Experience = {
  name: 'Experience',
  groupName: 'Experience',
  init() {
    this._experience = 0;
  },
  getExperience() {
    return this._experience;
  },
  setExperience(exp) {
    this._experience = exp;
  },
  addExperience(exp) {
    this._experience += exp;
  },
};

export const Inventory = {
  name: 'Inventory',
  groupName: 'Inventory',
  init(template) {
    const inventorySlots = template.inventorySlots || 10;
    this._items = new Array(inventorySlots);
  },
  getItems() {
    return this._items;
  },
  getItem(i) {
    return this._items[i];
  },
  addItem(item) {
    for (let i = 0; i < this._items.length; i++) {
      if (!this._items[i]) {
        this._items[i] = item;
        return true;
      }
    }
    return false;
  },
  removeItem(i) {
    if (this._items[i] && this.hasMixin('Equipper')) {
      this.unequip(this._items[i]);
    }
    this._items[i] = null;
  },
  canAddItem() {
    for (let i = 0; i < this._items.length; i++) {
      if (!this._items[i]) {
        return true;
      }
    }
    return false;
  },
  pickupItems(indices) {
    const mapItems = this._map.getItemsAt(this.getX(), this.getY(), this.getZ());
    let added = 0;
    for (let i = 0; i < indices.length; i++) {
      if (this.addItem(mapItems[indices[i] - added])) {
        mapItems.splice(indices[i] - added, 1);
        added++;
      } else {
        break;
      }
    }
    this._map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
    return added === indices.length;
  },
  dropItem(i) {
    if (this._items[i]) {
      if (this._map) {
        this._map.addItem(this.getX(), this.getY(), this.getZ(), this._items[i]);
      }
      this.removeItem(i);
    }
  },
};

export const Hunger = {
  name: 'Hunger',
  init(template) {
    this._maxFullness = template.maxFullness || 1000;
    this._fullness = template.fullness || (this._maxFullness / 2);
    this._fullnessDepletionRate = template.fullnessDepletionRate || 1;
  },
  addTurnHunger() {
    this.modifyFullnessBy(-this._fullnessDepletionRate);
  },
  modifyFullnessBy(pts) {
    this._fullness += pts;
    if (this._fullness <= 0) {
      this.kill('You have died of starvation!');
    } else if (this._fullness > this._maxFullness) {
      this.kill('You choke and die!');
    }
  },
  getHungerState() {
    const perPercent = this._maxFullness / 100;
    if (this._fullness <= perPercent * 5) {
      return 'Starving';
    } else if (this._fullness <= perPercent * 25) {
      return 'Hungry';
    } else if (this._fullness >= perPercent * 95) {
      return 'Oversatiated';
    } else if (this._fullness >= perPercent * 75) {
      return 'Full';
    } else {
      return 'Not Hungry';
    }
  },
};

export const CorpseDropper = {
  name: 'CorpseDropper',
  init(template) {
    this._corpseDropRate = template.corpseDropRate  || 100;
  },
  tryDropCorpse() {
    if (Math.round(Math.random() * 100) < this._corpseDropRate) {
      this._map.addItem(
        this.getX(),
        this.getY(),
        this.getZ(),
        ItemRepository.create('corpse', {
          name: `${this._name} corpse`,
          fg: this._fg,
        })
      );
    }
  },
};

export const Equipper = {
  name: 'Equipper',
  init() {
    this._weapon = null;
    this._armor = null;
  },
  wield(item) {
    this._weapon = item;
  },
  unwield() {
    this._weapon = null;
  },
  wear(item) {
    this._armor = item;
  },
  takeOff() {
    this._armor = null;
  },
  getWeapon() {
    return this._weapon;
  },
  getArmor() {
    return this._armor;
  },
  unequip(item) {
    // Helper function to be called before getting rid of an item.
    if (this._weapon === item) {
      this.unwield();
    }
    if (this._armor === item) {
      this.takeOff();
    }
  },
};