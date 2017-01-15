import Map from '../map';
import EntityRepository from '../entities';
import ItemRepository from '../items';
import { HoleToCavernTile } from '../tile';

export default class Cave extends Map {
  constructor(tiles, player) {
    super(tiles);
    window.cave = this;

    this.addEntityAtRandomPosition(player, 0);

    for (let z = 0; z < this._depth; z++) {
      for (let i = 0; i < 15; i++) {
        const entity = EntityRepository.createRandom();
        this.addEntityAtRandomPosition(entity, z);
        if (entity.hasMixin('Experience')) {
          for (let level = 0; level < z; level++) {
            entity.giveExperience(entity.getNextLevelExperience() - entity.getExperience());
          }
        }
      }

      for (let i = 0; i < 15; i++) {
        this.addItemAtRandomPosition(ItemRepository.createRandom(), z);
      }
    }

    const templates = [
      'dagger', 'sword', 'staff', 'tunic', 'chainmail', 'platemail',
    ];

    for (let i = 0; i < templates.length; i++) {
      this.addItemAtRandomPosition(
        ItemRepository.create(templates[i]),
        Math.floor(this._depth * Math.random())
      );
    }

    const holeDepth = this._depth - 1;
    const holePosition = this.getRandomFloorPosition(holeDepth);
    this._tiles[holeDepth][holePosition.x][holePosition.y] = HoleToCavernTile;
  }
}
