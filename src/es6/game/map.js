import ROT from 'rot-js';
import { FungusTemplate } from './templates';
import Entity from './entity';
import { NullTile, FloorTile } from './tile';

export default class Map {
  constructor(tiles, player) {
    // tiles
    this._tiles = tiles;
    this._width = tiles.length;
    this._height = tiles[0].length;

    // entities
    this._entities = [];
    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);

    this.addEntityAtRandomPosition(player);

    for (let i = 0; i < 50; i++) {
      this.addEntityAtRandomPosition(new Entity(FungusTemplate));
    }
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  getTile(x, y) {
    let ret = NullTile;
    if (!(x < 0 || x >= this._width || y < 0 || y >= this.height)) {
      ret = this._tiles[x][y] || ret;
    }
    return ret;
  }

  dig(x, y) {
    if (this.getTile(x, y).isDiggable()) {
      this._tiles[x][y] = FloorTile;
    }
  }

  getRandomFloorPosition() {
    let x;
    let y;
    do {
      x = Math.floor(Math.random() * this._width);
      y = Math.floor(Math.random() * this._height);
    } while (!this.isEmptyFloor(x, y));
    return { x, y };
  }

  getEngine() {
    return this._engine;
  }

  getEntities() {
    return this._entities;
  }

  getEntityAt(x, y) {
    for (let i = 0; i < this._entities.length; i++) {
      let entity = this._entities[i];
      if (entity.getX() == x && entity.getY() == y) {
        return entity;
      }
    }
    return null;
  }

  addEntity(entity) {
    if (entity.getX() < 0 || entity.getX() >= this._width || entity.getY() < 0 || entity.getY() >= this._height) {
      throw new Error('Adding entity out of bounds.');
    }

    entity.setMap(this);
    this._entities.push(entity);

    if (entity.hasMixin('Actor')) {
      this._scheduler.add(entity, true);
    }
  }

  addEntityAtRandomPosition(entity) {
    const position = this.getRandomFloorPosition();
    entity.setX(position.x);
    entity.setY(position.y);
    this.addEntity(entity);
  }

  removeEntity(entity) {
    for (let i = 0; i < this._entities.length; i++) {
      if (this._entities[i] == entity) {
        this._entities.splice(i, 1);
        break;
      }
    }
    if (entity.hasMixin('Actor')) {
      this._scheduler.remove(entity);
    }
  }

  isEmptyFloor(x, y) {
    return this.getTile(x, y) == FloorTile && !this.getEntityAt(x, y);
  }
}
