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
} from './mixins';

export const PlayerTemplate = {
  char: '@',
  fg: 'white',
  maxHP: 40,
  attackValue: 10,
  sightRadius: 6,
  mixins: [
    PlayerActor,
    Attacker,
    Digger,
    Destructible,
    MessageRecipient,
    Sight,
    Experience,
  ],
};

export const FungusTemplate = {
  name: 'fungus',
  char: 'F',
  fg: 'green',
  maxHP: 10,
  experienceValue: 1,
  mixins: [
    FungusActor,
    Destructible,
  ],
};

export const BatTemplate = {
  name: 'Bat',
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
};

export const NewtTemplate = {
  name: 'Newt',
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
};
