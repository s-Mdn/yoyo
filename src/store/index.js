import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import profile from '@/reducers/profile';
import play from '@/reducers/play';
import quality from '@/reducers/quality';

import PlayAutoReducer from './reducers/play-auto'
import LoginReducer from './reducers/login'


const rootReducer = combineReducers({
  profile,
  play,
  quality,
  userInfo: LoginReducer.UpdateUserInfo,
  playItem: PlayAutoReducer.UpdatePlayItem,
  playList: PlayAutoReducer.UpdatePlayList,
  playState: PlayAutoReducer.UpdatePlayState,
  goodsList: PlayAutoReducer.UpdateGoodsList,
  backGroungL: PlayAutoReducer.UpdateBackGroundListVertical,
  backGroungH: PlayAutoReducer.UpdateBackGroundListHorizontal,
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(thunk)
  )
)

store.subscribe(()=> {})
export default store
