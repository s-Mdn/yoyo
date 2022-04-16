import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
const AutoPlay = React.lazy(() => import('@/pages/AutoPlay'));
const GoodsManage = React.lazy(() => import('@/pages/GoodsManage'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const GoodsInfo = React.lazy(() => import('@/pages/GoodsInfo'));
const PlayInfo = React.lazy(()=>import('@/pages/PlayInfo'))

function ContentMain(props) {
  const { token } = props;
  return (
    <div style={{ padding: '15px', position: 'relative' }} className='content_h'>
      <Switch>
        <Route exact path='/autoplay' component={AutoPlay} />
        <Route exact path='/goodsmanage' component={GoodsManage} />
        <Route exact path='/profile' component={Profile} />
        <Route exact path='/goods/:id?' component={GoodsInfo} />
        <Route exact path='/plays/:id?' component={PlayInfo} />
        <Redirect from='/' to={ token? '/autoplay' : '/login'} />
        {
          !token && <Redirect to='/login'/>
        }
      </Switch>
    </div>
  );
}

const mapStateToProps = (state) => ({
  token: state?.userInfo?.token,
});
export default connect(mapStateToProps)(ContentMain);
