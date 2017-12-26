import ROT from 'rot-js';
import Player from './player';
import Map from './map';
import FOV from './fov';
import Movement from './movement';

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
  const container = document.getElementById("main");
  container.innerHTML = '';
  const display = new ROT.Display(displaySettings);
  container.appendChild(display.getContainer());
  return display;
}

let messages = [];

function clearMessages() {
  messages = [];
  player.clearMessages();
}

function drawMessages() {
  const messageContainer = document.getElementById("messages");
  messageContainer.innerHTML = '';
  messages.forEach(msg => {
    const el = document.createElement('div');
    el.innerHTML = msg;
    messageContainer.appendChild(el);
  })
}

const display = setup();
const player = new Player({ x: 1, y: 1 });
const map = new Map({ width: 21, height: 21 });
const movement = new Movement({player, map});
const fov = new FOV({player, map});

window.Game = {
  display, player, map, movement, fov, messages
};


function setMessages() {
  const tile = map.getTile(player.x, player.y);
  if (tile.contents.length > 0) {
    messages.push('You see ' + tile.contents[tile.contents.length - 1].name);
  }
  if (player.messages.length > 0) {
    messages = messages.concat(player.messages);
  }
};
function handleInput(constant) {
  switch (constant) {
    case ROT.VK_LEFT:
      movement.movePlayerBy(-1, 0);
      break;
    case ROT.VK_RIGHT:
      movement.movePlayerBy(1, 0);
      break;
    case ROT.VK_DOWN:
      movement.movePlayerBy(0, 1);
      break;
    case ROT.VK_UP:
      movement.movePlayerBy(0, -1);
      break;
    case ROT.VK_G:
      player.pickupItem(map.getTile(player.x, player.y), messages);
      break;
    default:
      break;
  }
  update(display)
}

function update(display) {
  display.clear();
  map.drawExploredMap(display);
  fov.draw(display);
  setMessages();
  drawMessages();
  clearMessages();
}

document.addEventListener("keyup", function (e) {
  var code = e.keyCode;
  

  let vk = "?";
  for (let name in ROT) {
    if (ROT[name] == code && name.indexOf("VK_") == 0) { vk = name; }
  }
  
  handleInput(code);
});

update(display);
