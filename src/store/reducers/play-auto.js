import { PlayAutoActions } from '../actions';

import background_one_l from '@/assets/images/background-1.png';
import background_two_l from '@/assets/images/background-2.png';
import background_three_l from '@/assets/images/background-3.png';
import background_four_l from '@/assets/images/background-4.png';
import background_five_l from '@/assets/images/background-5.png';

import background_one_h from '@/assets/images/background-1-1.jpg';
import background_two_h from '@/assets/images/background-2-2.png';
import background_three_h from '@/assets/images/background-3-3.png';
import background_four_h from '@/assets/images/background-4-4.png';
import background_five_h from '@/assets/images/background-5-5.png';

// 竖向背景图
const backGroundListVertical = [
  {
    id: 999,
    checked: false,
    image: background_one_l,
  },
  {
    id: 998,
    checked: false,
    image: background_two_l,
  },
  {
    id: 997,
    checked: false,
    image: background_three_l,
  },
  {
    id: 996,
    checked: true,
    image: background_four_l,
  },
  {
    id: 995,
    checked: false,
    image: background_five_l,
  },
];

// 横向默认背景
const backgroundListHorizontal = [
  {
    id: 999,
    checked: false,
    image: background_one_h,
  },
  {
    id: 998,
    checked: false,
    image: background_two_h,
  },
  {
    id: 997,
    checked: false,
    image: background_three_h,
  },
  {
    id: 996,
    checked: true,
    image: background_four_h,
  },
  {
    id: 995,
    checked: false,
    image: background_five_h,
  },
];



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
   * @description 添加竖屏背景图和更新
   * @param {array} state
   * @param {*} action
   */
  UpdateBackGroundListVertical: (state = backGroundListVertical, action) => {
    switch( action.type ) {
      case PlayAutoActions.AddBackGroungVertical:
        return[
          ...state,
          ...action.data
        ]
      default:
        return state
    }
  },

  /**
   * @description 添加竖横背景图和更新
   * @param {array} state
   * @param {*} action
   */
  UpdateBackGroundListHorizontal: (state = backgroundListHorizontal, action) => {
    switch( action.type ) {
      case PlayAutoActions.AddBackGroungHorizontal:
        return[
          ...state,
          ...action.data
        ]
      default:
        return state
    }
  }
};

export default PlayAutoReducer;
