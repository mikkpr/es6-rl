import ROT from 'rot-js';
import { FungusTemplate } from './templates';
import Entity from './entity';
import { NullTile, FloorTile } from './tile';

export default class Map {
  constructor(tiles, player) {
    // tiles
    this._tiles = tiles;
    this._depth = tiles.length;
    this._width = tiles[0].length;
    this._height = tiles[0][0].length;

    // entities
    this._entities = [];

    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);

    this.addEntityAtRandomPosition(player, 0);

    for (let z = 0; z < this._depth; z++) {
      for (let i = 0; i < 25; i++) {
        this.addEntityAtRandomPosition(new Entity(FungusTemplate), z);
      }
    }

    // fov
    this._fov = [];
    this.setupFOV();

    // exploration data
    this._explored = new Array(this._depth);
    this.setupExploredArray();
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
    for (let i = 0; i < this._entities.length; i++) {
      const entity = this._entities[i];
      if (entity.getX() === x && entity.getY() === y && entity.getZ() === z) {
        return entity;
      }
    }
    return null;
  }

  getEntitiesWithinRadius(centerX, centerY, centerZ, radius) {
    const results = [];
    const leftX = centerX - radius;
    const rightX = centerX + radius;
    const topY = centerY - radius;
    const bottomY = centerY + radius;

    for (let i = 0; i < this._entities.length; i++) {
      const entity = this._entities[i];
      if (entity.getX() >= leftX &&
        entity.getX() <= rightX &&
        entity.getY() >= topY &&
        entity.getY() <= bottomY &&
        entity.getZ() === centerZ) {
          results.push(entity);
        }
    }
    return results;
  }

  addEntity(entity) {
    if (
      entity.getX() < 0 || entity.getX() >= this._width ||
      entity.getY() < 0 || entity.getY() >= this._height ||
      entity.getZ() < 0 || entity.getZ() >= this._depth
    ) {
      throw new Error('Adding entity out of bounds.');
    }

    entity.setMap(this);
    this._entities.push(entity);

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

  removeEntity(entity) {
    for (let i = 0; i < this._entities.length; i++) {
      if (this._entities[i] === entity) {
        this._entities.splice(i, 1);
        break;
      }
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
}
