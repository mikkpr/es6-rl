import Entity from './entity';
import { FungusTemplate } from './templates';

import Game from './index';

export const Moveable = {
  name: 'Moveable',
  tryMove(x, y, map) {
    const tile = map.getTile(x, y);
    const target = map.getEntityAt(x, y);

    if (target) {
      if (this.hasMixin('Attacker')) {
        this.attack(target);
        return true;
      }
    } else if (tile.isWalkable()) {
      this._x = x;
      this._y = y;
      return true;
    } else if (tile.isDiggable()) {
      if (this.hasMixin('Digger')) {
        this.dig(x, y, map);
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
          if (this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset)) {
            const entity = new Entity(FungusTemplate);
            entity.setX(this.getX() + xOffset);
            entity.setY(this.getY() + yOffset);
            this.getMap().addEntity(entity);
            this._growthsRemaining--;

            Game.sendMessageNearby(this.getMap(), entity.getX(), entity.getY(), 'The fungus is spreading!');
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
  dig(x, y, map) {
    map.dig(x, y);
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
      let attack = this.getAttackValue();
      let defense = target.getDefenseValue();
      let max = Math.max(0, attack - defense);
      let damage = 1 + Math.floor(Math.random() * max);

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
