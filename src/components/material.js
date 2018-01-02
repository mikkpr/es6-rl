const MaterialComponent = Base =>
  class extends Base {
    constructor() {
      super(...arguments);
      
      this._materialProperties = [];
    }
    
    get materialProperties() {
      return this._materialProperties;
    }
    
    setProperty(prop) {
      if (this.hasProperty(prop)) { return false; }
      
      this._materialProperties.push(prop);
      
      return true;
    }

    hasProperty(prop) {
      return this._materialProperties.includes(prop);
    }
  };

export default MaterialComponent;
