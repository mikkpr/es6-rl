import ROT from 'rot-js';

export default class FOV {
  constructor({player, map, display}) {
    this.player = player;
    this.map = map;
    this.fov = new ROT.FOV.RecursiveShadowcasting((x, y) => {
      if (this.map.hasTileFor(x, y)) {
        return !this.map.getTile(x, y).tile.solid;
      } else {
        return false;
      }
    })
  }
  
  draw(display) {
    Object.values(this.map.tiles).forEach(tile => {tile.visible = false});
    this.fov.compute(this.player.x, this.player.y, this.player.viewDistance, (x, y, r, visibility) => {
      if (this.map.hasTileFor(x, y)) {
        const tile = this.map.getTile(x, y);
        tile.visible = true;
        tile.explored = true;
        display.draw(tile.x, tile.y, tile.tile.char, '#FFF') 
      }
    })
    display.draw(this.player.x, this.player.y, this.player.char);
  }
}
