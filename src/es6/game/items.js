import Item from './item';
import {
  Edible,
  Equippable,
} from './itemmixins';
import Repository from './repository';

export const ItemRepository = new Repository('items', Item);

ItemRepository.define('apple', {
  name: 'apple',
  char: '%',
  fg: 'red',
  foodValue: 50,
  mixins: [
    Edible,
  ],
});

ItemRepository.define('melon', {
  name: 'melon',
  char: '%',
  foodValue: 35,
  consumptions: 4,
  fg: 'lightGreen',
  mixins: [
    Edible,
  ],
});

ItemRepository.define('rock', {
  name: 'rock',
  char: '*',
  fg: 'white',
  attackValue: 3,
  wieldable: true,
  mixins: [
    Equippable,
  ],
});

ItemRepository.define('corpse', {
  name: 'corpse',
  char: '%',
  foodValue: 75,
  consumptions: 1,
  mixins: [
    Edible,
  ],
}, {
  disableRandomCreation: true,
});

ItemRepository.define('pumpkin', {
  name: 'pumpkin',
  char: '%',
  fg: 'orange',
  foodValue: 50,
  attackValue: 2,
  defenseValue: 2,
  wearable: true,
  wieldable: true,
  mixins: [
    Edible,
    Equippable,
  ],
});

// Weapons
ItemRepository.define('dagger', {
  name: 'dagger',
  char: ')',
  fg: 'gray',
  attackValue: 5,
  wieldable: true,
  mixins: [
    Equippable,
  ],
}, {
  disableRandomCreation: true,
});

ItemRepository.define('sword', {
  name: 'sword',
  char: ')',
  fg: 'white',
  attackValue: 10,
  wieldable: true,
  mixins: [
    Equippable,
  ],
}, {
  disableRandomCreation: true,
});

ItemRepository.define('staff', {
  name: 'staff',
  char: ')',
  fg: 'yellow',
  attackValue: 5,
  defenseValue: 3,
  wieldable: true,
  mixins: [
    Equippable,
  ],
}, {
  disableRandomCreation: true,
});

// Wearables
ItemRepository.define('tunic', {
  name: 'tunic',
  char: '[',
  fg: 'green',
  defenseValue: 2,
  wearable: true,
  mixins: [
    Equippable,
  ],
}, {
  disableRandomCreation: true,
});

ItemRepository.define('chainmail', {
  name: 'chainmail',
  char: '[',
  fg: 'white',
  defenseValue: 4,
  wearable: true,
  mixins: [
    Equippable,
  ],
}, {
  disableRandomCreation: true,
});

ItemRepository.define('platemail', {
  name: 'platemail',
  char: '[',
  fg: 'aliceblue',
  defenseValue: 6,
  wearable: true,
  mixins: [
    Equippable,
  ],
}, {
  disableRandomCreation: true,
});

export default ItemRepository;
