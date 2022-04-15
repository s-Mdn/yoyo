import utils from '@/utils'
const { auth }  = utils

const profile = (state = {}, action) => {
  console.log( action.type )
  switch (action.type) {
    case 'ADD_PROFILE':
      return {
        ...action.profile,
      };
    case 'MODIFY_PROFILE':
      return state;
    case 'CLEAR_ALL':
      return {}
    default:
      return auth.getLocal('userInfo')? JSON.parse(auth.getLocal('userInfo')) : {};
  }
};


export default profile;
