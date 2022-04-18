import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Empty, message, Upload } from 'antd';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import {
  CameraTwoTone,
  CloseCircleTwoTone,
  CheckCircleTwoTone,
} from '@ant-design/icons';

import { PlayAutoActions } from '@/store/actions'
import constData from '@/constant/play-auto'
import API from '@/services';
import yoyo from '@/assets/images/model_yoyo.png';
import './index.less';

const client = new W3CWebSocket()
const AutoPlay = (props) => {
  const {
    playList, playItem, backGroungListL, backGroungListH, playState,
    wiwnDirection, goodsList, backGroundL, backGroundH,
    handleUpdatePlayList, handleAddPlayItem, handleClearPlayItem, handleClearGoodsList, handleAddGoodsList,
    handleAddBackGroundListVertical, handleAddBackGroundListHorizontal,
    handleUpdateBackGroundL, handleUpdateBackGroundH, handleWinDirection,
  } = props;

  // 选中播放
  const handleSelectPlays = (p) => {
    playList.filter((e) => {e.checked = p.id === e.id;return e})
    handleAddPlayItem(p)

    // 根据ID获取播放商品
    getGoodsList(p.id);
  };

  // 选中背景图
  const handleSelectBackGround = (m, i) => {
    backGroungListL.filter((e, v)=>{e.checked = i === v; return e})
    backGroungListH.filter((e, v)=>{e.checked = i === v; return e})

    handleUpdateBackGroundL(backGroungListL[i])
    handleUpdateBackGroundH(backGroungListH[i])
  };

  // 删除背景图
  const handelDeleteBackGround = (m, i) => {
    if( m.checked ){
      message.warning('正在使用，无法删除！', 0.5)
      return false
    }

    API.autoPlayApi.deleteBackground(m.id).then(r => {
      let l = backGroungListL.filter((e, v) =>{ return i !== v })
      let h = backGroungListH.filter((e, v) =>{ return i !== v })

      handleAddBackGroundListVertical(l)
      handleAddBackGroundListHorizontal(h)
    }).catch(e =>{
      message.error(e || '删除失败！')
      return false
    })
  }

  // 获取播放内容
  const getPlaylist = () => {
    API.autoPlayApi.getPlaylist()
      .then(r =>{
        const tempList = r.data.content
        // 匹配上一次选中的play
        tempList.forEach(p =>p.checked = p.id === playItem.id)
        handleUpdatePlayList(tempList)

        // 如果播放列表为空 || 没有匹配到上一次选中的，则清空playItem和goodsList
        if(!tempList.length || tempList.some(e=>e.checked)) {
          handleClearPlayItem()
          handleClearGoodsList()
        }
      }).catch(e =>{
        message.error(e || '获取数据失败！');
        return false
      })
  };

  // 获取商品列表
  const getGoodsList =  (id) => {
    const data = {
      play_list_id: id,
      size: 999,
    }
    API.autoPlayApi.getGoodsList(data)
      .then(r => {
        handleAddGoodsList(r.data)
      }).catch(e => {
        message.error(e || '获取商品信息失败！')
        return false
      })
  };

  // 获取背景图
  const getBackground = () => {
    API.autoPlayApi
      .getBackground()
      .then((r) => {
        let l = constData.backGroundListL.slice()
        let h = constData.backGroundListH.slice()

        l.push(...r.data.content)
        h.push(...r.data.content)

        handleAddBackGroundListVertical(l)
        handleAddBackGroundListHorizontal(h)
      })
      .catch((e) => {
        message.error(e || '获取背景图失败！');
        return false;
      });
  };

  // 上传背景图
  const uploadBackGround = async ({ fileList, file }) => {
    if (file.status === 'done') {
      const image = file.response.data

      API.autoPlayApi.addBackground({image})
        .then(r => {
          getBackground()
        }).catch(e => {
          message.error(e || '上传失败！')
          return false
        })
    }
  };

  // 商品 && 人物缩放
  const handleScale = (dom, winDom) => {
    console.log( dom, winDom )
    const o = document.getElementsByClassName(dom)[0];
    const c = document.getElementsByClassName(winDom)[0];
    let r = wiwnDirection
      ? (o.offsetWidth / o.offsetHeight / 10).toFixed(6)
      : (o.offsetHeight / o.offsetWidth / 10).toFixed(6);

    o.onmousewheel = function (e) {
      //获取图片的宽高
      const offsetWidth = o.offsetWidth;
      const offsetHeight = o.offsetHeight;
      if (e.wheelDelta > 0) {
        const setWidth = offsetWidth + offsetWidth * r;
        const setHeight = offsetHeight + offsetHeight * r;

        o.style.width = setWidth + 'px';
        o.style.height = setHeight + 'px';

        // 竖屏状态下，图片的缩放宽度如果大于等于限制窗口的宽度，即不可以在放大，横屏则人物的缩放的高度如果大于等于窗口的高度，则不可在放大
        if (wiwnDirection) {
          // 限宽
          if (setWidth >= c.offsetWidth) {
            o.style.width = c.offsetWidth + 'px';
            o.style.height = c.offsetWidth / (r * 10) + 'px';
          }
        } else {
          // 限高
          if (setHeight >= c.offsetHeight) {
            o.style.height = c.offsetHeight + 'px';
            o.style.width = c.offsetHeight / (r * 10) + 'px';
          }
        }

        // 限制上下位置
        if (c.offsetHeight <= o.offsetHeight + o.offsetTop) {
          o.style.top = c.offsetHeight - o.offsetHeight + 'px';
        }

        // 限制左右位置
        if (c.offsetWidth <= o.offsetWidth + o.offsetLeft) {
          o.style.left = c.offsetWidth - o.offsetWidth + 'px';
        }
      } else {
        o.style.width = offsetWidth - offsetWidth * r + 'px';
        o.style.height = offsetHeight - offsetHeight * r + 'px';
      }
    };
  };


  // 请求播放列表
  useEffect(() => {
    getPlaylist();
    getBackground();
  }, [])// eslint-disable-line

  // 缩放
  useEffect(()=>{
    if(wiwnDirection) {
      handleScale('person_h_level', 'window_level');
      handleScale('person_h_level', 'window_level');
    } else {
      handleScale('person_h_straight', 'window_straight');
      handleScale('person_h_level', 'window_level');
    }
  })


  return (
    <div className='auto_play flex justify-between h-full overflow-hidden'>
      <div className='left flex-1 rounded bg-white h-full p_b_15px'>
        <div className='play_list'>
          <div className='border-b text-center h_45 line_h_44'>直播列表</div>
          <div className='flex flex-wrap play_list_h pt-4'>
            {
              !playList.length && (
                <div className='relative mt-24 mx-auto'>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              )
            }
            {playList.map((e) => (
              <div
                className='w_100px h_120px m_l_20px m_b_20px relative'
                key={e.id}
              >
                <div
                  className='felx items-center justify-centers border w-full h_100px rounded overflow-hidden'
                  onClick={handleSelectPlays.bind(this, e)}
                >
                  <img
                    src={e.cover_image}
                    className='object-fit-cover w-full h-full'
                    alt=''
                  />
                </div>
                <div className='text-center px-2 text-overflow font_12'>
                  {e.name}
                </div>
                <div className='selected_icon flex items-center justify-center absolute -top_7px -right_7px'>
                  {e.checked && <CheckCircleTwoTone twoToneColor='#ff8462' />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='background_list'>
          <div className='border-b text-center h_45 line_h_44'>直播背景</div>
          <div className='flex flex-wrap background_list_h pt-4'>
            {wiwnDirection ? (
              <>
                {backGroungListL.map((e, i) => (
                  <div
                    className='h_100px w_100px m_l_20px m_b_20px relative'
                    key={e?.id}
                  >
                    <div className='felx items-center justify-centers border w-full h-full rounded overflow-hidden'>
                      <img
                        onClick={handleSelectBackGround.bind(this, e, i)}
                        src={e.image}
                        className='object-fit-cover w-full h-full'
                        alt=''
                      />
                    </div>
                    {
                      <div className='selected_icon flex items-center justify-center absolute -top_7px -right_7px'>
                        {/* {e.checked && <CheckCircleTwoTone twoToneColor='#ff8462' />} */}
                      </div>
                    }
                    {
                      (i > 4) &&
                      <div
                        className='delete_icon flex items-center justify-center absolute -top_7px -right_7px'
                        onClick={handelDeleteBackGround.bind(this, e, i)}
                      >
                        <CloseCircleTwoTone twoToneColor='#ff8462'/>
                      </div>
                    }
                  </div>
                ))}
              </>
            ) : (
              <>
                {backGroungListH.map((e, i) => (
                  <div
                    className='h_100px w_100px m_l_20px m_b_20px relative'
                    key={e?.id}
                  >
                    <div className='felx items-center justify-centers border w-full h-full rounded overflow-hidden'>
                      <img
                        onClick={handleSelectBackGround.bind(this, e, i)}
                        src={e.image}
                        className='object-fit-cover w-full h-full'
                        alt=''
                      />
                    </div>
                    <div className='selected_icon flex items-center justify-center absolute -top_7px -right_7px'>
                      {/* {e.checked && (
                        <CheckCircleTwoTone twoToneColor='#ff8462' />
                      )} */}
                    </div>
                  </div>
                ))}
              </>
            )}
            {backGroungListH.length < 9 && (
              <div className='h_100px w_100px m_l_20px m_b_20px'>
                <div className='border w-full h-full rounded overflow-hidden'>
                  <Upload
                    data={file=>({
                      suffix: file.name.slice(file.name.lastIndexOf('.')),
                      preffix: 'feedbackImg'
                    })}
                    onChange={uploadBackGround}
                    action={`${process.env.REACT_APP_API}/api/common/upload`}
                    accept='.jpg, .png, .gif, .webp'
                  >
                    <div className='relative h_100px w_100px'>
                      <div className='absolute top-0 left-0 z-10 w-full h-full rounded text-center mt-5'>
                        <CameraTwoTone twoToneColor='#000' />
                        <p style={{ marginTop: '10px' }} className='font_12'>image</p>
                      </div>
                    </div>
                  </Upload>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='center m_l_r_15px w_405  box-border'>
        <div className='flex relative rounded play_window_h'>
          {wiwnDirection ? (
            <div className='h-full w-full window_level relative'>
              <img className='h-full w-full object-fit-cover' alt='背景图' src={backGroundL.image}/>
              <div className='goods_level absolute top_20vh right-0 w_20vh h_20vh rounded overflow-hidden'>
                <img
                  src={playItem.cover_image}
                  className='object-fit-cover w-full h-full'
                  alt=''
                />
              </div>
              <div className='person_h_level absolute bottom-0 left-0 bg-black'>
                <img src={yoyo} alt='人物' />
              </div>
            </div>
          ) : (
            <div className='flex items-center h-full w-full'>
              <div className='window_straight w-full relative'>
                <img className='h-full w-full object-fit-cover block' alt='背景图' src={backGroundH.image}/>
                <div className='goods_straight absolute top-8 right-6 w_20vh h_20vh rounded overflow-hidden'>
                  <img
                    src={playItem.cover_image}
                    className='object-fit-cover w-full h-full'
                    alt=''
                  />
                </div>
                <div className='person_h_straight absolute bottom-0 left-5'>
                  <img src={yoyo} alt='人物' />
                </div>
              </div>
            </div>
          )}
          <div
            className='absolute right-0 top-2 px-1 font_12 color_ff8462 bg-001529 rounded-l cursor-pointer'
            onClick={handleWinDirection.bind(this, !wiwnDirection)}
          >
            {wiwnDirection ? '横屏' : '竖屏'}
          </div>
        </div>

        <div className='h_60px rounded bg-white m_t_15px flex items-center justify-center px-4 box-border'>
          {goodsList.length ? (
            <button
              className='bg-ff8462 px-6 py-1.5 rounded-full text-white'
            >
              {!playState ? <span>开始直播</span> : <span>关闭直播</span>}
            </button>
          ) : (
            <button className='bg_ccc px-6 py-1.5 rounded-full text-white'>
              开始直播
            </button>
          )}
        </div>
      </div>

      <div className='flex-1 rounded bg-white'>
        <div className='border-b text-center h_45 line_h_44'>
          直播间互动
        </div>
        <div className='flex flex-wrap pt-4'>
          <div className='empty_icon mt-24 mx-auto'>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  playList: state.playList,
  goodsList: state.goodsList,
  playItem: state.playItem,
  playState: state.playState,
  backGroungListL: state.backGroungListL,
  backGroungListH: state.backGroungListH,
  backGroundL: state.backGroundL,
  backGroundH: state.backGroundH,

  wiwnDirection: state.winDirection
});

const mapDispatchToProps = (dispatch) => ({
  // 添加播放列表
  handleUpdatePlayList: (data) => {
    dispatch({
      type: PlayAutoActions.UpdatePlayList,
      data
    })
  },

  // 添加播放内容
  handleAddPlayItem: (data) => {
    dispatch({
      type: PlayAutoActions.AddPlayItem,
      data
    })
  },

  // 清空播放内容
  handleClearPlayItem: ()=> {
    dispatch({
      type: PlayAutoActions.ClearPlayItem,
    })
  },

  // 添加商品
  handleAddGoodsList: (data) => {
    dispatch({
      type: PlayAutoActions.AddGoodsList,
      data
    })
  },

  // 清空商品
  handleClearGoodsList: () => {
    dispatch({
      type: PlayAutoActions.ClearGoodsList,
      data: []
    })
  },

  // 添加竖背景列表
  handleAddBackGroundListVertical: (data) => {
    dispatch({
      type: PlayAutoActions.AddBackGroungVertical,
      data
    })
  },

  // 添加横背景列表
  handleAddBackGroundListHorizontal: (data) => {
    dispatch({
      type: PlayAutoActions.AddBackGroungHorizontal,
      data
    })
  },

  // 更新竖背景
  handleUpdateBackGroundL: (data) =>{
    dispatch({
      type: PlayAutoActions.UpdateBackGroundVertical,
      data
    })
  },

  // 添加横背景
  handleUpdateBackGroundH: (data) =>{
    dispatch({
      type: PlayAutoActions.UpdateBackGroundHorizontal,
      data
    })
  },

  // 横竖屏切换
  handleWinDirection: (data) => {
    dispatch({
      type: PlayAutoActions.UpdateDirection,
      data
    })
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(AutoPlay);
