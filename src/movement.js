export default class Movement {
  constructor({player, map}) {
    this.player = player;
    this.map = map;
  }
  
  canMove (originX, originY, destX, destY) {
    return this.map.tiles[`${destX},${destY}`] && !this.map.tiles[`${destX},${destY}`].tile.solid;
  }
  
  movePlayerBy(dx, dy) {
    const [x, y] = this.player.position;
    
    if (this.canMove(x, y, x + dx, y + dy, this.map)) {
      this.player.move(dx, dy);
    }
  }
}
