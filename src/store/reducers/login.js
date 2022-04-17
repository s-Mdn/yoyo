import { LoginActions } from '../actions'

const LoginReducer = {
  /**
   * @description 更新个人信息
   * @param {object} state
   * @param {*} action
   * @returns
   */
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
    }
  }
}
export default LoginReducer
