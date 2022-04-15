import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Empty, message, Upload } from 'antd';
import {
  CameraTwoTone,
  CloseCircleTwoTone,
  CheckCircleTwoTone,
} from '@ant-design/icons';
import { PlayAutoActions } from '@/store/actions'


import API from '@/services';
import yoyo from '@/assets/images/character_model_yoyo.png';
import './index.less';
import constData from '@/constant/play-auto'

const AutoPlay = (props) => {
  const {
    playList, handleUpdatePlayList, handleAddPlayItem, playItem, goodsList, handleAddGoodsList, backGroungL, backGroungH, playState,
    handleAddBackGroundListVertical, handleAddBackGroundListHorizontal
  } = props;
  // 横竖屏
  const [reverse, setReverse] = useState(true);
  // ws
  const localServerUrl = process.env.REACT_APP_LOCAL_SERVER_URL;
  // 背景图(竖向)
  const [backGroundVertica, setBackGroundVertica] = useState({});
  // 背景图(横向)
  const [backGroundHorizontal, setBackGroundHorizontal] = useState({});
  // 背景图列表(竖向)
  const [backGroundListVertical, setBackgroundListVertical] = useState([]);
  // 背景图列表(横向)
  const [backGroundListHorizontal, setBackgroundListHorizontal] = useState([]);

  // 选中播放
  const handleSelectPlays = (p) => {
    playList.filter((e) => {e.checked = p.id === e.id;return e})
    handleAddPlayItem(p)

    // 根据ID获取商品
    getGoodsList(p.id);
  };

  // 选中背景图
  const handleSelectBackGround = (m, i) => {
    setBackGroundVertica(backGroundListVertical[i]);
    setBackGroundHorizontal(backGroundListHorizontal[i])

    let l = backGroundListVertical.filter((e, v) => {e.checked = i === v;return e});
    let h = backGroundListHorizontal.filter((e, v) => {e.checked = i === v;return e});

    setBackgroundListVertical(l)
    setBackgroundListHorizontal(h)
  };

  // 删除背景图
  const handelDeleteBackGround = (m, i) => {
    if( m.checked ){
      message.warning('正在使用，无法删除！')
      return false
    }
    API.autoPlayApi.deleteBackground(m.id).then(r => {
      let l = backGroundListVertical.filter((e, v) =>{ return i !== v })
      let h = backGroundListHorizontal.filter((e, v) =>{ return i !== v })

      setBackgroundListVertical(l)
      setBackgroundListHorizontal(h)
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
  const handleUploadChange = async ({ fileList, file }) => {
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

  // 请求播放列表
  useEffect(() => {
    getPlaylist();
    getBackground();
  }, []);

  return (
    <div className='auto_play flex justify-between h-full overflow-hidden'>
      <div className='left flex-1 rounded bg-white h-full p_b_15px'>
        <div className='play_list'>
          <div className='border-b text-center h_45 line_h_44'>直播列表</div>
          <div className='flex flex-wrap play_list_h pt-4'>
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
            {reverse ? (
              <>
                {backGroungL.map((e, i) => (
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
                      // <div className='selected_icon flex items-center justify-center absolute -top_7px -right_7px'>
                      //   {e.checked && <CheckCircleTwoTone twoToneColor='#ff8462' />}
                      // </div>
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
                {backGroungH.map((e, i) => (
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
            {backGroungL.length < 9 && (
              <div className='h_100px w_100px m_l_20px m_b_20px'>
                <div className='border w-full h-full rounded overflow-hidden'>
                  <Upload
                    data={file=>({
                      suffix: file.name.slice(file.name.lastIndexOf('.')),
                      preffix: 'feedbackImg'
                    })}
                    onChange={handleUploadChange}
                    action={`${process.env.REACT_APP_API}/api/common/upload`}
                    accept='.jpg, .png, .gif, .webp'
                  >
                    <div className='relative w-full h-full'>
                      <div className='absolute top-0 left-0 z-10 w-full h-full rounded text-center mt-4'>
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
          {reverse ? (
            <div className='h-full w-full window_level relative'>
              <img className='h-full w-full object-fit-cover block' alt='背景图' src={backGroundVertica.image}/>
              <div className='goods absolute top_20vh right-0 w_20vh h_20vh rounded border overflow-hidden'>
                <img
                  src={playItem.cover_image}
                  className='w-full h-full object-fit-fill'
                  alt=''
                />
              </div>
              <div className='person_h_level absolute bottom-0 left-0'>
                <img src={yoyo} alt='人物' />
              </div>
            </div>
          ) : (
            <div className='flex items-center h-full w-full'>
              {/* 横 */}
              <div className='window_straight w-full relative'>
                <img className='h-full w-full object-fit-cover block' alt='背景图' src={backGroundHorizontal.image}/>
                <div className='goods absolute top-8 right-6 w_20vh h_20vh rounded border overflow-hidden'>
                  <img
                    src={playItem.cover_image}
                    className='w-full h-full object-fit-fill'
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
            className='absolute right-0 top-2 font_12 color_FF8462 px-1 bg-001529 rounded-l cursor-pointer'
            onClick={() => setReverse((reverse) => !reverse)}
          >
            {reverse ? '横屏' : '竖屏'}
          </div>
        </div>

        <div className='h_60px rounded bg-white mt_15px flex items-center justify-center px-4 box-border'>
          {Object.keys(playItem).length ? (
            <button
              className='bg-FF8462 px-6 py-1.5 rounded-full text-white'
            >
              {!playState ? <span>开始直播</span> : <span>关闭直播</span>}
            </button>
          ) : (
            <button className='bg_CCC px-6 py-1.5 rounded-full text-white'>
              开始直播
            </button>
          )}
        </div>
      </div>

      <div className='flex-1 rounded bg-white'>
        <div className='border-b text-center mb-3 h_45 line_h_44'>
          直播间互动
        </div>
        <div className='interactive_area_h relative'>
          <div className='absolute empty_icon'>
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
  backGroungL: state.backGroungL,
  backGroungH: state.backGroungH,
});

const mapDispatchToProps = (dispatch) => ({
  // 开始播放 || 停止播放
  handlePlay: (actions) => {
    dispatch(actions);
  },

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

  // 添加竖背景
  handleAddBackGroundListVertical: (data) => {
    dispatch({
      type: PlayAutoActions.AddBackGroungVertical,
      data
    })
  },

  // 添加横背景
  handleAddBackGroundListHorizontal: (data) => {
    dispatch({
      type: PlayAutoActions.AddBackGroungHorizontal,
      data
    })
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(AutoPlay);
