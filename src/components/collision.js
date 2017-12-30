const CollisionComponent = Base =>
  class extends Base {
    constructor() {
      super(...arguments);
      
      this._collides = true;
    }
    
    get collides() {
      return this._collides;
    }

    set collides(v) {
      this._collides = v && true;
    }
  };

export default CollisionComponent;
