import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { message } from 'antd';
import TitleBar from 'frameless-titlebar';

import { PlayAutoActions, LoginActions } from '@/store/actions'
import { titleBar } from '@/utils';
import logo from '@/assets/images/logo.png';

const Popover = React.lazy(()=>import('@/components/Popover'))

// 当前窗口
const currentWindow = titleBar.getCurrentWindow();

function Titlebar(props) {
  const { userInfo, playState } = props
  const [maximized, setMaximized] = useState(currentWindow?.isMaximized());

  // 双击和点击控制窗口按钮来控制窗口
  const handleMaximize = () => {
    setMaximized((maximized) => !maximized);
  };

  // 退出
  const handleLoginOut = () => {
    if( playState ) {
      message.warning('正在播放，无法退出！')
      return false
    }

    props.handleLoginOut()
  }

  // 关闭
  const handleClose = () => {
    if( playState ) {
      message.warning('正在播放，无法关闭！')
      return false
    }
    currentWindow?.close()
  }

  useEffect(() => {
    if (maximized) {
      currentWindow?.maximize();
    } else {
      currentWindow?.unmaximize();
    }
  }, [maximized]);

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
        <Popover userInfo={userInfo} loginOut={handleLoginOut} />
      )}
    </TitleBar>
  );
};

const mapDispatchToProps = (dispatch) => ({
  handleLoginOut: () => {
    const isLoad = localStorage.getItem('isLoad')
    localStorage.clear()
    localStorage.setItem('isLoad', isLoad)
    /**
     * 清除选中的播放
     */
    dispatch({
      type: PlayAutoActions.ClearPlayItem,
    })
    /**
     * 清除播放商品列表
     */
    dispatch({
      type: PlayAutoActions.ClearGoodsList
    })
    /**
     * 清空播放列表
     */
    dispatch({
      type: PlayAutoActions.ClearPlayList
    })
    /**
     * 清除竖向背景图列表
     */
    dispatch({
      type: PlayAutoActions.ClearBackGroungVertical
    })
    /**
     * 清除横背景图列表
     */
    dispatch({
      type: PlayAutoActions.ClearBackGroungHorizontal
    })
    /**
     * 清除选中的竖背景图
     */
    dispatch({
      type: PlayAutoActions.UpdateBackGroundVertical,
      data: {}
    })
    /**
     * 清除选中的横背景图
     */
    dispatch({
      type: PlayAutoActions.UpdateBackGroundHorizontal,
      data: {}
    })
    /**
     * 清除个人信息
     */
    dispatch({
      type: LoginActions.ClearUserInfo,
    })
    /**
     * 更新横竖屏
     */
    dispatch({
      type: PlayAutoActions.UpdateDirection,
      data: true
    })
  },
});

const mapStateToProps = (state) => ({
  userInfo: state.userInfo || {},
  playState: state.playState,
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Titlebar))
