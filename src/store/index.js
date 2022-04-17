import thunk from 'redux-thunk';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { LoginReducer, PlayAutoReducer, ProfileReducer } from './reducers'

const rootReducer = combineReducers({
  userInfo: LoginReducer.UpdateUserInfo,
  resolute: ProfileReducer.UpdateResolute,
  playItem: PlayAutoReducer.UpdatePlayItem,
  playList: PlayAutoReducer.UpdatePlayList,
  playState: PlayAutoReducer.UpdatePlayState,
  goodsList: PlayAutoReducer.UpdateGoodsList,
  backGroungListL: PlayAutoReducer.UpdateBackGroundListVertical,
  backGroungListH: PlayAutoReducer.UpdateBackGroundListHorizontal,
  backGroundL: PlayAutoReducer.UpdateBackGroundL,
  backGroundH: PlayAutoReducer.UpdateBackGroundH,
  winDirection: PlayAutoReducer.UpdateDirection
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
