import Item from './entity';
import Repository from './repository';

export const ItemRepository = new Repository('items', Item);

ItemRepository.define('apple', {
  name: 'apple',
  char: '%',
  fg: 'red',
});

ItemRepository.define('rock', {
  name: 'rock',
  char: '*',
  fg: 'white',
});

export default ItemRepository;
