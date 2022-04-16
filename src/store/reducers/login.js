import { LoginActions } from '../actions'

const LoginReducer = {
  UpdateUserInfo: (state = {}, action) => {
    switch (action.type) {
      case LoginActions.UpdateUserInfo:
        return {
          ...state,
          ...action.data
        }
      case LoginActions.ClearUserInfo:
        return {}
      default:
        return localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo'))
        // return state
    }
  }
}
export default LoginReducer
