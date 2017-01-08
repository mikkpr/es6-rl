import Item from './item';
import {
  Edible,
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
  fg: 'green',
  mixins: [
    Edible,
  ],
});

ItemRepository.define('rock', {
  name: 'rock',
  char: '*',
  fg: 'white',
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

export default ItemRepository;
