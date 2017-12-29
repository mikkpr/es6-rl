const DescriptionComponent = Base =>
  class extends Base {
    constructor() {
      super(...arguments);

      this._name = '';
    }

    get name() {
      return this._name;
    }

    set name(v) {
      this._name = v || '';
    }
  };

export default DescriptionComponent;
