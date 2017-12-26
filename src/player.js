export default class Player {
  constructor({x, y}) {
    this.x = x;
    this.y = y;
    this.char = '@';
    this.inventory = new Inventory();
    this.messages = [];
  }
  
  clearMessages() {
    this.messages = [];
  }
  
  addMessage(msg) {
    this.messages.push(msg);
  }
  
  get viewDistance() {
    if (this.inventory.contains('TORCH')) {
      return 6;
    }
    return 3;
  }
  
  get position() {
    return [this.x, this.y];
  }
  
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
  
  pickupItem(tile) {
    if (tile.contents.length > 0) {
      const item = tile.contents.pop();
      console.log(item)
      this.inventory.add(item);
      this.addMessage('You pick up ' + item.name);
    }
  }
}

class Inventory {
  constructor() {
    this.contents = [];
  }
  
  add(item) {
    this.contents.push(item);
  }
  
  remove(item) {
    this.contents = this.contents.filter(i => i !== item);
  }
  
  contains(itemID) {
    return this.contents.filter(item => item.id === itemID).length > 0;
  }
}
