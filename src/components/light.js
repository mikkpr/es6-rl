const LightComponent = Base =>
  class extends Base {
    constructor() {
      super(...arguments);

      this._lightSourceActive = false;
      this._lightRadius = 5;
      this._lightSourceColor = [255, 255, 255];
    }

    set enableLight(v) {
      this._lightSourceActive = v;
    }

    get lightsourceActive() {
      return this._lightSourceActive;
    }

    get lightRadius() {
      return this._lightRadius;
    }

    set lightRadius(v) {
      this._lightRadius = v;
    }

    set lightColor(v) {
      this._lightSourceColor = v || [255, 255, 255];
    }

    get lightColor() {
      return this._lightSourceColor
    }
  };

export default LightComponent;
