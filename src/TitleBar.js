import React, { useEffect, useState } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import TitleBar from 'frameless-titlebar';
import Popover from '@/components/Popover';
import utils from '@/utils';
import action from '@/actions';
import logo from '@/assets/images/logo.png';
import { message } from 'antd';


const { auth, main } = utils;
const { login, play } = action;

// 读取Electro
const getCurrentWindow = () => {
  if (window.isElectron) {
    const remote = main.getElectronModule('remote');
    if (remote) {
      return remote.getCurrentWindow();
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// 当前窗口
const currentWindow = getCurrentWindow();

function Titlebar(props) {
  const { userInfo, handleLoginOut, handlePlay, token, playState } = props

  // 管理窗口状态
  const [maximized, setMaximized] = useState(currentWindow?.isMaximized());

  // 双击和点击控制窗口按钮来控制窗口
  const handleMaximize = () => {
    setMaximized((maximized) => !maximized);
  };

  // 退出
  const loginOut = () => {
    if( playState ) {
      message.warning('正在播放，无法退出！')
      return false
    }
    auth.removeLocal('token');
    auth.removeLocal('userInfo');
    handleLoginOut(login.clearAll({}));
    handlePlay(play.stop(false))
    localStorage.removeItem('goodsWav')
    localStorage.removeItem('goodsUrl')
  }

  // 关闭
  const handleClose = () => {
    if( playState ) {
      message.warning('正在播放，无法退出！')
      return false
    }
    currentWindow?.close()
    handlePlay(play.stop(false))
    localStorage.removeItem('goodsWav')
    localStorage.removeItem('goodsUrl')
  }

  useEffect(() => {
    if (maximized) {
      currentWindow?.maximize();
    } else {
      currentWindow?.unmaximize();
    }
  }, [maximized]);

  if( !token ) {
    <Redirect to='/login'/>
  }

  return (
    <TitleBar
      id="title_bar"
      iconSrc={logo}
      currentWindow={currentWindow}
      platform={process.platform}
      onClose={handleClose}
      onMinimize={() => currentWindow?.minimize()}
      onMaximize={handleMaximize}
      onDoubleClick={handleMaximize}
      maximized={maximized}
    >
      {userInfo.token && (
        <Popover userInfo={userInfo} loginOut={loginOut} />
      )}
    </TitleBar>
  );
};

const mapDispatchToProps = (dispatch) => ({
  handleLoginOut: (action) => {
    dispatch(action)
  },
  handlePlay: (action) => {
    dispatch(action)
  }
});
const mapStateToProps = (state) => ({
  userInfo: state.profile,
  token: state.profile.token,
  playState: state.play,
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Titlebar))
