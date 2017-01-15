import {
  PlayerActor,
  FungusActor,
  Attacker,
  Destructible,
  Digger,
  MessageRecipient,
  Sight,
  TaskActor,
  GiantZombieActor,
  Experience,
  Inventory,
  Hunger,
  CorpseDropper,
  Equipper,
  RandomStatGainer,
  PlayerStatGainer,
} from './entitymixins';

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
    Hunger,
    Equipper,
    PlayerStatGainer,
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
  speed: 100,
  mixins: [
    FungusActor,
    Destructible,
    Experience,
    RandomStatGainer,
  ],
});

EntityRepository.define('bat', {
  name: 'bat',
  char: 'B',
  fg: 'white',
  maxHP: 5,
  attackValue: 4,
  experienceValue: 3,
  speed: 2000,
  mixins: [
    TaskActor,
    Attacker,
    Destructible,
    CorpseDropper,
    Experience,
    RandomStatGainer,
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
    TaskActor,
    Attacker,
    Destructible,
    CorpseDropper,
    Experience,
    RandomStatGainer,
  ],
});

EntityRepository.define('kobold', {
  name: 'kobold',
  char: 'k',
  fg: 'white',
  maxHP: 6,
  attackValue: 4,
  sightRadius: 5,
  tasks: ['hunt', 'wander'],
  mixins: [
    TaskActor,
    Sight,
    Attacker,
    Destructible,
    CorpseDropper,
    Experience,
    RandomStatGainer,
  ],
});

EntityRepository.define('giant zombie', {
  name: 'giant zombie',
  char: 'Z',
  fg: 'teal',
  maxHP: 30,
  attackValue: 8,
  defenseValue: 5,
  level: 5,
  sightRadius: 6,
  mixins: [
    GiantZombieActor,
    Sight,
    Attacker,
    Destructible,
    CorpseDropper,
    Experience,
  ],
}, {
  disableRandomCreation: true,
});

EntityRepository.define('slime', {
  name: 'slime',
  char: 's',
  fg: 'lightGreen',
  maxHP: 10,
  attackValue: 5,
  sightRadius: 3,
  tasks: ['hunt', 'wander'],
  mixins: [
    TaskActor,
    Sight,
    Attacker,
    Destructible,
    CorpseDropper,
    Experience,
    RandomStatGainer,
  ],
});

export default EntityRepository;
