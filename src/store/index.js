import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import profile from '@/reducers/profile';
import play from '@/reducers/play';
import quality from '@/reducers/quality';


import AddPlayItemReducer from './reducers/AddPlayItemReducer'
import UpdatePlayList from './reducers/UpdatePlayList'
const rootReducer = combineReducers({
  profile,
  play,
  quality,
  playItem: AddPlayItemReducer,
  playList: UpdatePlayList,
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
