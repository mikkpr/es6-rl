// import { applyMiddleware, createStore } from 'redux';
// import createLogger from 'redux-logger';
// import ROT from 'rot-js';

// import gameReducer from './reducers';
// import initialState from './initialState';

import Game from './game';

((window, console) => {
  // window.STATE = createStore(
  //   gameReducer,
  //   initialState,
  //   applyMiddleware(createLogger())
  // );

  Game.switchScreen('StartScreen');

  const mainDisplay = Game.getDisplay();
  // const gameConsole = new ROT.Display({
  //   width: 45,
  //   height: 10,
  //   fontSize: 15,
  //   forceSquareRatio: true,
  // });

  document.querySelector('#main-display').appendChild(mainDisplay.getContainer());
  // document.querySelector('#console').appendChild(gameConsole.getContainer());

  // window.STATE.dispatch({
  //   type: 'ADD_MESSAGE',
  //   message: { text: 'hello, world!' },
  // });
})(window, window.console);
