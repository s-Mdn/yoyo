import { PlayAutoActions } from '../actions'

/**
 * @depe 添加播放
 * @param {object} state
 * @param {object} action
 * @returns object
 */
const AddPlayItemReducer = (state = {}, action) => {
  switch( action.type ) {
    case PlayAutoActions.AddPlayItem:
      return {
        ...state,
        ...action.data
      }
    default:
      return {}
  }
}
export default AddPlayItemReducer
