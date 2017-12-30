const PositionComponent = Base =>
  class extends Base {
    constructor() {
      super(...arguments);

      this._x = 0;
      this._y = 0;
      this._z = 0;
    }

    get x() {
      return this._x;
    }
    set x(v) {
      this._x = Math.floor(v);
    }

    get y() {
      return this._y;
    }
    set y(v) {
      this._y = Math.floor(v);
    }
    
    get z() {
      return this._z;
    }
    set z(v) {
      this._z = Math.floor(v);
    }
  };
  
export default PositionComponent;
