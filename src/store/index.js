import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import profile from '@/reducers/profile';
import play from '@/reducers/play';
import quality from '@/reducers/quality';

import PlayAutoReducer from './reducers/play-auto'
import LoginReducer from './reducers/login'


const rootReducer = combineReducers({
  profile,
  userInfo: LoginReducer.UpdateUserInfo,
  play,
  quality,
  playItem: PlayAutoReducer.AddPlayItem,
  playList: PlayAutoReducer.UpdatePlayList,
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
