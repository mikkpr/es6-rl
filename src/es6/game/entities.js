import {
  PlayerActor,
  FungusActor,
  Attacker,
  Destructible,
  Digger,
  MessageRecipient,
  Sight,
  WanderActor,
  Experience,
  Inventory,
} from './mixins';

import Entity from './entity';
import Repository from './repository';

export const PlayerTemplate = {
  char: '@',
  fg: 'white',
  maxHP: 40,
  attackValue: 10,
  sightRadius: 6,
  inventorySlots: 22,
  mixins: [
    PlayerActor,
    Attacker,
    Digger,
    Destructible,
    MessageRecipient,
    Sight,
    Experience,
    Inventory,
  ],
};

export class Player extends Entity {
  constructor() {
    super(PlayerTemplate);
  }
}

const EntityRepository = new Repository('entities', Entity);

EntityRepository.define('fungus', {
  name: 'fungus',
  char: 'F',
  fg: 'green',
  maxHP: 10,
  experienceValue: 1,
  mixins: [
    FungusActor,
    Destructible,
  ],
});

EntityRepository.define('bat', {
  name: 'bat',
  char: 'B',
  fg: 'white',
  maxHP: 5,
  attackValue: 4,
  experienceValue: 3,
  mixins: [
    WanderActor,
    Attacker,
    Destructible,
  ],
});

EntityRepository.define('newt', {
  name: 'newt',
  char: ':',
  fg: 'yellow',
  maxHP: 3,
  attackValue: 2,
  experienceValue: 2,
  mixins: [
    WanderActor,
    Attacker,
    Destructible,
  ],
});

export default EntityRepository;
