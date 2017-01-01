const createMessage = (text) => ({
  type: 'ADD_MESSAGE',
  message: { text },
});

export default {
  createMessage,
};
