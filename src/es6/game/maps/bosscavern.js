import Map from '../map';
import { WallTile, FloorTile, WaterTile } from '../tile';
import EntityRepository from '../entities';

export default class BossCavern extends Map {
  constructor() {
    super(BossCavern.generateTiles(80, 24));
    window.bossCave = this;
    this.addEntityAtRandomPosition(EntityRepository.create('giant zombie'), 0);
  }

  static fillCircle(tiles, centerX, centerY, radius, tile) {
    const _tiles = tiles;
    let x = radius;
    let y = 0;
    let xChange = 1 - (radius << 1);
    let yChange = 0;
    let radiusError = 0;

    while (x >= y) {
      for (let i = centerX - x; i <= centerX + x; i++) {
        _tiles[i][centerY + y] = tile;
        _tiles[i][centerY - y] = tile;
      }

      for (let i = centerX - y; i <= centerX + y; i++) {
        _tiles[i][centerY + x] = tile;
        _tiles[i][centerY - x] = tile;
      }

      y++;
      radiusError += yChange;
      yChange += 2;
      if (((radiusError << 1) + xChange) > 0) {
        x--;
        radiusError += xChange;
        xChange += 2;
      }
    }
  }

  static generateTiles(width, height) {
    const tiles = new Array(width);
    for (let x = 0; x < width; x++) {
      tiles[x] = new Array(height);
      for (let y = 0; y < height; y++) {
        tiles[x][y] = WallTile;
      }
    }

    const radius = (Math.min(width, height) - 2) / 2;
    BossCavern.fillCircle(tiles, width / 2, height / 2, radius, FloorTile);

    const lakes = Math.round(Math.random() * 3) + 3;
    const maxRadius = 2;
    for (let i = 0; i < lakes; i++) {
        // Random position, taking into consideration the radius to make sure
        // we are within the bounds.
        let centerX = Math.floor(Math.random() * (width - (maxRadius * 2)));
        let centerY = Math.floor(Math.random() * (height - (maxRadius * 2)));
        centerX += maxRadius;
        centerY += maxRadius;
        // Random radius
        const lakeRadius = Math.floor(Math.random() * maxRadius) + 1;
        // Position the lake!
        BossCavern.fillCircle(tiles, centerX, centerY, lakeRadius, WaterTile);
    }

    // Return the tiles in an array as we only have 1 depth level.
    return [tiles];
  }

  addEntity(entity) {
    super.addEntity.call(this, entity);

    if (this.getPlayer() === entity) {
      const position = this.getRandomFloorPosition(0);
      entity.setPosition(position.x, position.y, 0);
      this.getEngine().start();
    }
  }
}
