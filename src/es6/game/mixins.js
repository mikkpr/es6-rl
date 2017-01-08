import Entity from './entity';
import EntityRepository from './entities';

import Game from './index';

export const PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',

  act() {
    // detect if game is over
    if (this.getHP() <= 0) {
      Game.Screen.PlayScreen.setGameEnded(true);
      Game.sendMessage(this, 'You have died! Press [ENTER] to continue.');
    }
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
    return this._defenseValue;
  },
  takeDamage(attacker, damage) {
    this._HP -= damage;

    if (this._HP <= 0) {
      Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);

      if (this.hasMixin(PlayerActor)) {
        this.act();
      } else {
        if (attacker.hasMixin('Experience')) {
          attacker.addExperience(this._experienceValue);
        }
        this.getMap().removeEntity(this);
      }
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
};

export const WanderActor = {
  name: 'WanderActor',
  groupName: 'Actor',
  act() {
    const moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
    if (Math.round(Math.random()) === 1) {
      this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ(), this.getMap());
    } else {
      this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ(), this.getMap());
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
