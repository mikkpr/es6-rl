export default class Player {
  constructor({x, y}) {
    this.x = x;
    this.y = y;
    this.char = '@';
  }
  
  get viewDistance() {
    return 5;
  }
  
  get position() {
    return [this.x, this.y];
  }
  
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}
