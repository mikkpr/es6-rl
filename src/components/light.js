const LightComponent = Base =>
  class extends Base {
    constructor() {
      super(...arguments);
      
      this._lightsourceActive = false;
      this._lightRadius = 5;
    }
    
    set enableLight(v) {
      this._lightsourceActive = v;
    }
    
    get lightsourceActive() {
      return this._lightsourceActive;
    }
    
    get lightRadius() {
      return this._lightRadius;
    }
    
    set lightRadius(v) {
      this._lightRadius = v;
    }
  };

export default LightComponent;
