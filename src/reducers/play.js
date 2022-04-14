const play = (state = false, action) => {
  console.log(action)
  switch (action.type) {
    case 'START_PLAY':
      return true;
    case 'STOP_PLAY':
      return false;
    default:
      return false
  }
};

export default play;
