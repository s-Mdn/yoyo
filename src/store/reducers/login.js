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
        return state
    }
  }
}
export default LoginReducer
