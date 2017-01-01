import initialState from '../initialState';

const game = (state = initialState.game, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return Object.assign({}, state, { messages: state.messages.concat([action.message]) });
    default:
      return state;
  }
};

export default game;
