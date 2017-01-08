import {
  Moveable,
  PlayerActor,
  FungusActor,
  Attacker,
  Destructible,
  Digger,
  MessageRecipient,
  Sight,
} from './mixins';

export const PlayerTemplate = {
  char: '@',
  fg: 'white',
  maxHP: 40,
  attackValue: 10,
  sightRadius: 6,
  mixins: [
    Moveable,
    PlayerActor,
    Attacker,
    Digger,
    Destructible,
    MessageRecipient,
    Sight,
  ],
};

export const FungusTemplate = {
  name: 'fungus',
  char: 'F',
  fg: 'green',
  maxHP: 10,
  mixins: [
    FungusActor,
    Destructible,
  ],
};
