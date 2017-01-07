import {
  Moveable,
  PlayerActor,
  FungusActor,
  Attacker,
  Destructible,
  Digger,
  MessageRecipient,
} from './mixins';

export const PlayerTemplate = {
  char: '@',
  fg: 'white',
  maxHP: 40,
  attackValue: 10,
  mixins: [
    Moveable,
    PlayerActor,
    Attacker,
    Digger,
    Destructible,
    MessageRecipient,
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
