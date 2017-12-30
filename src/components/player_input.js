import ROT from 'rot-js';

const PlayerInputComponent = Base =>
  class extends Base {
    constructor() {
      super(...arguments);

      this.keyHandlers = {
        [ROT.VK_LEFT]: this.tryMove('DIR_LEFT'),
        [ROT.VK_RIGHT]: this.tryMove('DIR_RIGHT'),
        [ROT.VK_DOWN]: this.tryMove('DIR_DOWN'),
        [ROT.VK_UP]: this.tryMove('DIR_UP')
      };

      this.handleInput = code => {
        if (Object.keys(this.keyHandlers).includes(code.toString())) {
          this.keyHandlers[code]();
        }
      };
    }
  };

export default PlayerInputComponent;
