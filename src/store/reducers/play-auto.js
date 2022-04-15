import { PlayAutoActions } from '../actions';
import constData from '@/constant/play-auto'
const { backGroundListL, backGroundListH } = constData

const PlayAutoReducer = {
  /**
   * @depe 添加播放
   * @param {object} state
   * @param {object} action
   * @returns object
   */
  UpdatePlayItem: (state = {}, action) => {
    switch (action.type) {
      case PlayAutoActions.AddPlayItem:
        return {
          ...action.data,
        };
      case PlayAutoActions.ClearPlayItem:
        return {}
      default:
        return state;
    }
  },

  /**
   * @description 添加播放列表，更新播放列表，清空播放列表
   * @param {object} state
   * @param {object} action
   */
  UpdatePlayList: (state = [], action) => {
    switch (action.type) {
      case PlayAutoActions.UpdatePlayList:
        return [...action.data];
      case PlayAutoActions.ClearPlayList:
        return [];
      default:
        return state;
    }
  },

  /**
   * @description 更新播放状态
   * @param {bolean} state
   * @param {*} action
   * @returns
   */
  UpdatePlayState: (state = false, action) => {
    switch( action.type ) {
      case PlayAutoActions.UpdatePlayState:
        return action.state
      default:
        return state
    }
  },

  /**
   * @description 添加播放商品，清空播放商品
   * @param {array} state
   * @param {*} action
   * @returns
   */
  UpdateGoodsList: (state = [], action) => {
    switch( action.type ) {
      case PlayAutoActions.AddGoodsList:
        return [...action.data]
      case PlayAutoActions.ClearGoodsList:
        return []
      default:
        return state
    }
  },

  /**
   * @description 竖屏背景图列表添加和更新
   * @param {array} state
   * @param {*} action
   */
  UpdateBackGroundListVertical: (state = [], action) => {
    switch( action.type ) {
      case PlayAutoActions.AddBackGroungVertical:
        return[...action.data]
      default:
        return state
    }
  },

  /**
   * @description 横背景图列表添加和更新
   * @param {array} state
   * @param {*} action
   */
  UpdateBackGroundListHorizontal: (state = [], action) => {
    switch( action.type ) {
      case PlayAutoActions.AddBackGroungHorizontal:
        return[...action.data]
      default:
        return state
    }
  },

  /**
   * @description 更新竖向背景图
   * @param {*} state
   * @param {*} action
   */
  UpdateBackGroundL: (state=backGroundListL[3], action) => {
    switch( action.type ) {
      case PlayAutoActions.UpdateBackGroundVertical:
        return {...action.data}
      default:
        return state
    }
  },

  /**
   * @description 更新竖向背景图
   * @param {*} state
   * @param {*} action
   */
  UpdateBackGroundH: (state=backGroundListH[3], action) => {
    switch( action.type ) {
      case PlayAutoActions.UpdateBackGroundHorizontal:
        return {...action.data}
      default:
        return state
    }
  }

};

export default PlayAutoReducer;
