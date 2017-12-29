import ROT from 'rot-js';
import Player from './player';
import Map from './map';
import FOV from './fov';
import Movement from './movement';

import ECS from '@fae/ecs';

import RenderSystem from './systems/render';
import InputSystem from './systems/input';

import Item from './entities/item';
import Player2 from './entities/player';

const ecs = new ECS();

function setup() {
  const displaySettings = {
    width: 21,
    height: 21,
    fontSize: 16,
    fontFamily: 'Fira Mono',
    spacing: 0.9,
    layout: 'rect',
    fg: 'white',
    forceSquareRatio: true
  };
  const container = document.getElementById('main');
  container.innerHTML = '';
  const display = new ROT.Display(displaySettings);
  container.appendChild(display.getContainer());
  return display;
}

/* let messages = [];

function clearMessages() {
  messages = [];
  player.clearMessages();
}

function drawMessages() {
  const messageContainer = document.getElementById('messages');
  messageContainer.innerHTML = '';
  messages.forEach(msg => {
    const el = document.createElement('div');
    el.innerHTML = msg;
    messageContainer.appendChild(el);
  });
} */

const display = setup();
/* const player = new Player({x: 1, y: 1}); */
/* const map = new Map({width: 21, height: 21});
const movement = new Movement({player, map});
const fov = new FOV({player, map}); */

ecs.addSystem(new RenderSystem(display));
ecs.addSystem(new InputSystem());
ecs.addEntity(new Player2(10, 10));
/* ecs.addEntity(new Item('a torch', '(', 'yellow', 'black')); */

window.Game = {
  display,
  /* player,
  map,
  movement,
  fov,
  messages, */
  ecs
};

/* function setMessages() {
  const tile = map.getTile(player.x, player.y);
  if (tile.contents.length > 0) {
    messages.push('You see ' + tile.contents[tile.contents.length - 1].name);
  }
  if (player.messages.length > 0) {
    messages = messages.concat(player.messages);
  }
}
*/

function update() {
  display.clear();
/*   map.drawExploredMap(display);
  fov.draw(display); */
  
  ecs.update();
  
/*   setMessages();
  drawMessages();
  clearMessages(); */
  
  requestAnimationFrame(update);
}

update();
