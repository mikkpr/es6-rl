import ROT from 'rot-js';

import ECS from '@fae/ecs';

import RenderSystem from './systems/render';
import MovementSystem from './systems/movement';

import Player from './entities/player';

import {createMap, setupDisplay} from './utils';

// set up some constants
const DISPLAY_WIDTH = 21;
const DISPLAY_HEIGHT = 21;

// initialize our ECS system
const ecs = new ECS();

// create display
const display = setupDisplay(DISPLAY_WIDTH, DISPLAY_HEIGHT);

// create initial map
const map = createMap(DISPLAY_WIDTH, DISPLAY_HEIGHT);
map.forEach(tile => ecs.addEntity(tile));

// create player
const player = new Player(5, 5);
ecs.addEntity(player);

// initialize systems
const renderer = new RenderSystem(display);
ecs.addSystem(renderer);

ecs.addSystem(new MovementSystem(renderer));

window.Game = {
  display,
  map,
  player,
  renderer,
  ecs
};

function update() {
  display.clear();

  renderer.clear();

  ecs.update();
};

document.addEventListener('keyup', e => {
  var code = e.keyCode;

  player.handleInput(code);
  
  update();
});

update();
