import ROT from 'rot-js';
import EntityRepository from './entities';
import ItemRepository from './items';
import { NullTile, FloorTile } from './tile';

export default class Map {
  constructor(tiles, player) {
    // tiles
    this._tiles = tiles;
    this._depth = tiles.length;
    this._width = tiles[0].length;
    this._height = tiles[0][0].length;

    // fov
    this._fov = [];
    this.setupFOV();

    // entities
    this._entities = {};

    // items
    this._items = {};

    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);

    this._player = player;
    this.addEntityAtRandomPosition(player, 0);

    for (let z = 0; z < this._depth; z++) {
      // create monsters
      for (let i = 0; i < (25 + 4 * z); i++) {
        this.addEntityAtRandomPosition(EntityRepository.createRandom(), z);
      }

      // create items
      for (let i = 0; i < (10 + 3 * z); i++) {
        this.addItemAtRandomPosition(ItemRepository.createRandom(), z);
      }
    }

    // Add weapons and armor to the map in random positions
    const templates = [
      'dagger', 'sword', 'staff', 'tunic', 'chainmail', 'platemail',
    ];
    for (let i = 0; i < templates.length; i++) {
      this.addItemAtRandomPosition(
        ItemRepository.create(templates[i]),
        Math.floor(this._depth * Math.random())
      );
    }

    // exploration data
    this._explored = new Array(this._depth);
    this.setupExploredArray();
  }

  getPlayer() {
    return this._player;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  getDepth() {
    return this._depth;
  }

  getTile(x, y, z) {
    let ret = NullTile;
    if (x >= 0 && x < this._width &&
      y >= 0 && y < this._height &&
      z >= 0 && z < this._depth
    ) {
      ret = this._tiles[z][x][y] || ret;
    }
    return ret;
  }

  getFOV(depth) {
    return this._fov[depth];
  }

  dig(x, y, z) {
    if (this.getTile(x, y, z).isDiggable()) {
      this._tiles[z][x][y] = FloorTile;
    }
  }

  getRandomFloorPosition(z) {
    let x;
    let y;
    do {
      x = Math.floor(Math.random() * this._width);
      y = Math.floor(Math.random() * this._height);
    } while (!this.isEmptyFloor(x, y, z));
    return { x, y, z };
  }

  getEngine() {
    return this._engine;
  }

  getEntities() {
    return this._entities;
  }

  getEntityAt(x, y, z) {
    return this._entities[`${x},${y},${z}`];
  }

  getEntitiesWithinRadius(centerX, centerY, centerZ, radius) {
    const leftX = centerX - radius;
    const rightX = centerX + radius;
    const topY = centerY - radius;
    const bottomY = centerY + radius;

    return Object.keys(this._entities).reduce((entities, key) => {
      const entity = this._entities[key];
      if (
        entity.getX() >= leftX &&
        entity.getX() <= rightX &&
        entity.getY() >= topY &&
        entity.getY() <= bottomY &&
        entity.getZ() == centerZ
      ) {
        return entities.concat([entity]);
      } else {
        return entities;
      }
    }, []);
  }

  addEntity(entity) {
    entity.setMap(this);
    this.updateEntityPosition(entity);

    if (entity.hasMixin('Actor')) {
      this._scheduler.add(entity, true);
    }
  }

  addEntityAtRandomPosition(entity, z) {
    const position = this.getRandomFloorPosition(z);
    entity.setX(position.x);
    entity.setY(position.y);
    entity.setZ(position.z);
    this.addEntity(entity);
  }

  updateEntityPosition(entity, oldX, oldY, oldZ) {
    // delete old entry
    if (typeof oldX === 'number') {
      const oldKey = `${oldX},${oldY},${oldZ}`;
      if (this._entities[oldKey] == entity) {
        delete this._entities[oldKey];
      }
    }

    // make sure entity is within game bounds
    if (
      entity.getX() < 0 || entity.getX() >= this._width ||
      entity.getY() < 0 || entity.getY() >= this._height ||
      entity.getZ() < 0 || entity.getZ() >= this._depth
    ) {
      throw new Error("Entity's position is out of bounds");
    }

    // check if new position is free
    const key = `${entity.getX()},${entity.getY()},${entity.getZ()}`;
    if (this._entities[key]) {
      throw new Error('Tried to add entity at an occupied position');
    }

    this._entities[key] = entity;
  }

  removeEntity(entity) {
    const key = `${entity.getX()},${entity.getY()},${entity.getZ()}`;
    if (this._entities[key] == entity) {
      delete this._entities[key];
    }
    if (entity.hasMixin('Actor')) {
      this._scheduler.remove(entity);
    }
  }

  isEmptyFloor(x, y, z) {
    return this.getTile(x, y, z) == FloorTile && !this.getEntityAt(x, y, z);
  }

  setupFOV() {
    const map = this;
    for (let z = 0; z < this._depth; z++) {
      (() => {
        const depth = z;
        map._fov.push(
          new ROT.FOV.PreciseShadowcasting(
            (x, y) => !map.getTile(x, y, depth).isBlockingLight(),
            { topology: 4 }
          )
        );
      })();
    }
  }

  setupExploredArray() {
    for (let z = 0; z < this._depth; z++) {
      this._explored[z] = new Array(this._width);
      for (let x = 0; x < this._width; x++) {
        this._explored[z][x] = new Array(this._height);
        for (let y = 0; y < this._height; y++) {
          this._explored[z][x][y] = false;
        }
      }
    }
  }

  setExplored(x, y, z, state) {
    if (this.getTile(x, y, z) !== NullTile) {
      this._explored[z][x][y] = state;
    }
  }

  getExplored(x, y, z) {
    if (this.getTile(x, y, z) !== NullTile) {
      return this._explored[z][x][y];
    } else {
      return false;
    }
  }

  getItemsAt(x, y, z) {
    return this._items[`${x},${y},${z}`];
  }

  setItemsAt(x, y, z, items) {
    const key = `${x},${y},${z}`;
    if (items.length === 0) {
      if (this._items[key]) {
        delete this._items[key];
      }
    } else {
      this._items[key] = items;
    }
  }

  addItem(x, y, z, item) {
    const key = `${x},${y},${z}`;
    if (this._items[key]) {
      this._items[key].push(item);
    } else {
      this._items[key] = [item];
    }
  }

  addItemAtRandomPosition(item, z) {
    const position = this.getRandomFloorPosition(z);
    this.addItem(position.x, position.y, position.z, item);
  }
}
