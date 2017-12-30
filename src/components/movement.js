const MovementComponent = Base =>
  class extends Base {
    constructor() {
      super(...arguments);

      this._validDestinations = {};
    }

    tryMove(direction) {
      return () => {
        if (this.validDestinations[direction]) {
          return this.getMove(direction);
        } else {
          return () => {};
        }
      };
    }

    getMove(direction) {
      switch (direction) {
        case 'DIR_LEFT':
          this.x -= 1;
          break;
        case 'DIR_RIGHT':
          this.x += 1;
          break;
        case 'DIR_UP':
          this.y -= 1;
          break;
        case 'DIR_DOWN':
          this.y += 1;
          break;
        default:
          break;
      }
    }

    get validDestinations() {
      return this._validDestinations;
    }

    set validDestinations(v) {
      this._validDestinations = v;
    }
  };

export default MovementComponent;
