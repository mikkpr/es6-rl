const InventoryComponent = Base =>
  class extends Base {
    constructor() {
      super(...arguments);

      this._contents = [];
    }

    get contents() {
      return this._contents;
    }

    addItem(uid) {
      this._contents.push(uid)
    }
    
    removeItem(uid) {
      this._contents = this._contents.filter(i => i.id !== uid);
    }
  };

export default InventoryComponent;
