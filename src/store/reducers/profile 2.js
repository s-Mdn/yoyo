import { ProfileActions } from '../actions'

const ProfileReducer = {
  /**
   * 清晰度
   */
  UpdateResolute: (state = 'MEDIUM', action) => {
    switch( action.type ) {
      case ProfileActions.UpdateResolute:
        return action.data
      default:
        return state
    }
  }
}
export default ProfileReducer;
