import { PlayAutoActions } from '../actions'

/**
 *
 * @param {object} state
 * @param {object} action
 */
const UpdatePlayList = (state = [], action) => {
  switch( action.type ) {
    case PlayAutoActions.UpdatePlayList:
      return [
        ...state,
        ...action.data
      ]
    case PlayAutoActions.ClearPlayList:
      return []
    default:
      return []
  }
}
export default UpdatePlayList
