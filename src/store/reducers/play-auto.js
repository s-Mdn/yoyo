import { PlayAutoActions } from '../actions'

const PlayAutoReducer = {
  /**
 * @depe 添加播放
 * @param {object} state
 * @param {object} action
 * @returns object
 */
  AddPlayItem: (state = {}, action) => {
    console.log( action.type, 'AddPlayItem' )
    switch (action.type) {
      case PlayAutoActions.AddPlayItem:
        return {
          ...state,
          ...action.data
        }
      default:
        return {}
    }
  },

  /**
 *
 * @param {object} state
 * @param {object} action
 */
  UpdatePlayList: (state = [], action) => {
    console.log( action.type, 'UpdatePlayList' )
    switch (action.type) {
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
}
export default PlayAutoReducer
