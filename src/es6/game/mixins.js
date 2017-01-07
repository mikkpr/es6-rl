import Entity from './entity';
import { FungusTemplate } from './templates';
import { StairsUpTile, StairsDownTile } from './tile';

import Game from './index';

export const Moveable = {
  name: 'Moveable',
  tryMove(x, y, z, map) {
    const tile = map.getTile(x, y, this.getZ());
    const target = map.getEntityAt(x, y, this.getZ());

    if (z < this.getZ()) {
      if (tile !== StairsUpTile) {
        Game.sendMessage(this, "You can't go up here!");
      } else {
        this.setPosition(x, y, z);
        Game.sendMessage(this, 'You ascend to level %d', [z + 1]);
      }
    } else if (z > this.getZ()) {
      if (tile !== StairsDownTile) {
        Game.sendMessage(this, "You can't go down here!");
      } else {
        this.setPosition(x, y, z);
        Game.sendMessage(this, 'You descend to level %d', [z + 1]);
      }
    } else if (target) {
      if (this.hasMixin('Attacker')) {
        this.attack(target);
        return true;
      }
    } else if (tile.isWalkable()) {
      this.setPosition(x, y, z);
      return true;
    } else if (tile.isDiggable()) {
      if (this.hasMixin('Digger')) {
        this.dig(x, y, z, map);
        return true;
      }
    }
    return false;
  },
};

export const PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',

  act() {
    Game.refresh();
    this.getMap().getEngine().lock();
    this.clearMessages();
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
            const entity = new Entity(FungusTemplate);
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

    this._defenseValue = template.defenseValue || 0;
  },
  getHP() {
    return this._HP;
  },
  getMaxHP() {
    return this._maxHP;
  },
  getDefenseValue() {
    return this._defenseValue;
  },
  takeDamage(attacker, damage) {
    this._HP -= damage;

    if (this._HP <= 0) {
      Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
      Game.sendMessage(this, 'You die!');

      this.getMap().removeEntity(this);
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
    return this._attackValue;
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
  init(template) {
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
