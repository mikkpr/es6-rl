import {
  Moveable,
  PlayerActor,
  FungusActor,
  SimpleAttacker,
  Destructible,
  Digger,
} from './mixins';

export const PlayerTemplate = {
  char: '@',
  fg: 'white',
  bg: 'black',
  mixins: [Moveable, PlayerActor, SimpleAttacker, Digger, Destructible],
};

export const FungusTemplate = {
  char: 'F',
  fg: 'green',
  mixins: [FungusActor, Destructible],
};
