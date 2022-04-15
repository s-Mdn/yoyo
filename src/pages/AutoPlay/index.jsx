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
import utils from '@/utils';
import API from '@/services';
import action from '@/actions';
import yoyo from '@/assets/images/character_model_yoyo.png';
import './index.less';
import background_one_ver from '@/assets/images/background-1.png';
import background_two_ver from '@/assets/images/background-2.png';
import background_three_ver from '@/assets/images/background-3.png';
import background_four_ver from '@/assets/images/background-4.png';
import background_five_ver from '@/assets/images/background-5.png';

import background_one_hor from '@/assets/images/background-1-1.jpg';
import background_two_hor from '@/assets/images/background-2-2.png';
import background_three_hor from '@/assets/images/background-3-3.png';
import background_four_hor from '@/assets/images/background-4-4.png';
import background_five_hor from '@/assets/images/background-5-5.png';

const {
  type: { toString, toObject },
  validate: { validURL, isImage },
  auth: { getLocal, setLocal },
} = utils;
const {
  play: { stop, start },
} = action;

// 竖向默认背景
const backGroundListVerticalConstant = [
  {
    id: 999,
    checked: false,
    image: background_one_ver,
  },
  {
    id: 998,
    checked: false,
    image: background_two_ver,
  },
  {
    id: 997,
    checked: false,
    image: background_three_ver,
  },
  {
    id: 996,
    checked: true,
    image: background_four_ver,
  },
  {
    id: 995,
    checked: false,
    image: background_five_ver,
  },
];
// 横向默认背景
const backgroundListHorizontalConstant = [
  {
    id: 999,
    checked: false,
    image: background_one_hor,
  },
  {
    id: 998,
    checked: false,
    image: background_two_hor,
  },
  {
    id: 997,
    checked: false,
    image: background_three_hor,
  },
  {
    id: 996,
    checked: true,
    image: background_four_hor,
  },
  {
    id: 995,
    checked: false,
    image: background_five_hor,
  },
];

const AutoPlay = (props) => {
  const { playState, handlePlay, playItem, handleUpdatePlayItem, playList, handleUpdatePlayList } = props;
  // 商品列表
  const [goodsList, setGoodsList] = useState([]);
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
    // let tempList = playList.filter((e) => {e.checked = p.id === e.id;return e})

    handleUpdatePlayItem(p)
    // handleUpdatePlayList(tempList)
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
    console.log( 0 )
    API.autoPlayApi.getPlaylist()
      .then(r =>{
        let tempRes = r.data.content
        tempRes.forEach(p =>p.checked = false)
        // 缓存到redux
        handleUpdatePlayList(tempRes)
      }).catch(e =>{
        message.error(e || '获取数据失败！');
        return false
      })
  };

  // 获取背景图
  const getBackground = () => {
    const backGround = toObject(getLocal('background'));

    API.autoPlayApi
      .getBackground()
      .then((r) => {
        let l = [...backGroundListVerticalConstant, ...r.data.content]
        let h = [...backgroundListHorizontalConstant, ...r.data.content]
        // 筛选上一次选中的背景图(竖向)

        l.filter((e, i) => {
          e.checked = e.id === backGround?.id;
          return e;
        });

        // 筛选上一次选中的背景图(横向)
        h.filter((e) => {
          e.checked = e.id === backGround?.id;
          return e;
        });

        // 横竖向背景图
        setBackgroundListVertical(l);
        setBackgroundListHorizontal(h);
      })
      .catch((e) => {
        message.error(e || '获取背景图失败！');
        return false;
      });
  };

  // 获取商品列表
  const getGoodsList = async (id) => {
    let response = null;
    let data = {
      play_list_id: id,
      size: 999,
    };

    // 设loading加载效果
    try {
      response = await API.autoPlayApi.getGoodsList(data);
    } catch (error) {
      message.error('获取商品失败！');
      return false;
    }

    if (response && response.code === 200) {
      setGoodsList(response.data);
    }
  };

  // 获取商品的位置
  const getGoodsPositions = (dom, winDom) => {
    const o = document.getElementsByClassName(winDom)[0];
    const c = document.getElementsByClassName(dom)[0];

    const size = {
      window: {
        w: o.offsetWidth,
        h: o.offsetHeight,
      },
      product_resize: {
        w: c.offsetWidth,
        h: c.offsetHeight,
        x1: c.offsetLeft,
        y1: c.offsetTop,
        x2: o.offsetWidth - c.offsetLeft,
        y2: o.offsetHeight - c.offsetTop,
      },
    };
    return size;
  };

  // 获取人物位置和尺寸
  const getPersonPositions = (dom, winDom) => {
    const o = document.getElementsByClassName(winDom)[0];
    const c = document.getElementsByClassName(dom)[0];

    return {
      w: c.offsetWidth,
      h: c.offsetHeight,
      x1: c.offsetLeft,
      y1: c.offsetTop,
      x2: o.offsetWidth - c.offsetLeft,
      y2: o.offsetHeight - c.offsetTop,
    };
  };

  // 通过 ws 连接视频处理服务器
  const connectVideoProcess = () => {
    // const { localServerWsClient: client } = window;
    // // 背景图
    // let bg = validURL(backGround.image)
    //   ? backGround.image
    //   : `../build${backGround.image}`;

    // if (process.env.NODE_ENV !== 'development') {
    //   bg = validURL(backGround.image)
    //     ? backGround.image
    //     : `../app.asar.unpacked${backGround.image}`;
    // }

    // // 背景图 和 清晰度
    // const Initialize = 'start->' + toString({ bg, clarity: ' MEDIUM' });

    // if (client) {
    //   client.send(Initialize);
    //   sendGoodsToServe(client, goodsList);
    // } else {
    //   const client = new W3CWebSocket(localServerUrl);
    //   // 用于指定连接失败后的回调函数
    //   client.onerror = (error) => {
    //     message.info({
    //       icon: <></>,
    //       top: 0,
    //       content: '服务连接失败，请检查网路！',
    //     });
    //   };

    //   // 用于指定连接成功后的回调函数y
    //   client.onopen = () => {
    //     client.send(Initialize);
    //     sendGoodsToServe(client, goodsList);
    //     window.localServerWsClient = client;
    //   };

    //   // 用于指定连接关闭后的回调函数
    //   client.onclose = () => {
    //     handlePlay(stop());
    //     window.localServerWsClient = null;
    //   };

    //   // 接受信息
    //   client.onmessage = (event) => {
    //     console.log(event);
    //   };
    // }
  };

  // 断开视频处理服务器
  const disConnectVideoProcess = () => {
    const { localServerWsClient: client } = window;
    if (client) {
      client.send('stop->{}');
    }
  };

  // 连接要直播的内容和信息
  const sendGoodsToServe = (client, goodsList) => {
    let data = goodsList.map((e) => ({
      action_tag_list: e.action_tag_list,
      word_list: e.word_list || null,
      video_url: e.video_url || null,
      speed_list: e.speed_list,
      wav_url_list: e.wav_url_list,
      image: e.image || null,
      is_landscape: reverse,
      resize: false,
      window: !reverse
        ? getGoodsPositions('goods-img', 'winVer').window
        : getGoodsPositions('goods-img', 'winHorizont').window,
      product_resize: !reverse
        ? getGoodsPositions('goods-img', 'winVer').product_resize
        : getGoodsPositions('goods-img', 'winHorizont').product_resize,
      avatar_resize: !reverse
        ? getPersonPositions('person', 'winVer')
        : getPersonPositions('person', 'winHorizont'),
    }));
    client.send('sequence->' + toString(data));
  };

  // 直播 || 关闭
  const handleVideoProcess = async () => {
    if (playState) {
      // 销毁进程
      disConnectVideoProcess();
      handlePlay(stop());
    } else {
      connectVideoProcess();
      handlePlay(start());
    }
  };

  // 商品 && 人物拖动
  const handleDragStart = (e, dom, winDom) => {
    document.getElementsByTagName('body')[0].ondragstart = function () {
      window.event.returnValue = false;
      return false;
    };

    const o = document.getElementsByClassName(winDom)[0];
    const c = document.getElementsByClassName(dom)[0];

    // 计算
    const disX = e.clientX - c.offsetLeft;
    const disY = e.clientY - c.offsetTop;

    document.onmousemove = function (e) {
      // 计算移动对象在限定的范围内的位置
      let left = e.clientX - disX;
      let top = e.clientY - disY;

      // 左右侧限制
      left <= 0 && (left = 0);
      left >= o.offsetWidth - c.offsetWidth &&
        (left = o.offsetWidth - c.offsetWidth);

      // 上下侧限制
      top <= 0 && (top = 0);
      top >= o.offsetHeight - c.offsetHeight &&
        (top = o.offsetHeight - c.offsetHeight);

      c.style.left = left + 'px';
      c.style.top = top + 'px';
    };

    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmousedown = null;
    };
  };

  // 商品 && 人物缩放
  const handleScale = (dom, winDom) => {
    const o = document.getElementsByClassName(dom)[0];
    const c = document.getElementsByClassName(winDom)[0];
    let r = !reverse
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
        if (!reverse) {
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

  // 上传先钩子函数
  const handleBeforeUpload = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片不能超过5mb!');
    }
    const isJpgOrPng =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/gif' ||
      file.type === 'image/webp';

    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG/GIF/WEBP的文件');
    }
    return isJpgOrPng && isLt5M;
  };

  // Upload 组件方法
  const handleUploadChange = async ({ fileList, file }) => {
    if (file.status === 'done') {
      // await API.autoPlayApi.addBackground({
      //   image: file?.response.data,
      // });
      // getBackground();
    }
  };

  // upload参数
  const data = (file) => {
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    return {
      suffix: suffix,
      preffix: 'feedbackImg',
    };
  };

  // 删除背景图
  // const handleDeleteBackgound = async (u) => {
  //   console.log( u )
  //   try {
  //     await API.autoPlayApi.deleteBackground(id)
  //   } catch (error) {
  //     message.error('删除失败！');
  //     return false;
  //   }

  //   localStorage.removeItem('background')
  //   setBackGround(backGroundListVertical[3])
  //   getBackground()
  // };

  // 横竖屏切换背景图
  // useEffect(() => {
  //   if (!reverse) {
  //     // 商品缩放
  //     handleScale('goods-img', 'winVer');
  //     // 人物缩放
  //     handleScale('person', 'winVer');
  //   } else {
  //     // 商品缩放
  //     handleScale('goods-img', 'winHorizont');
  //     // 人物缩放
  //     handleScale('person', 'winHorizont');
  //   }

  // }, [reverse]);

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
                {backGroundListVertical.map((e, i) => (
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
                {backGroundListHorizontal.map((e, i) => (
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
                      {e.checked && (
                        <CheckCircleTwoTone twoToneColor='#ff8462' />
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            {backGroundListHorizontal.length < 9 && (
              <div className='h_100px w_100px m_l_20px m_b_20px'>
                <div className='border w-full h-full rounded overflow-hidden'>
                  <Upload
                    data={data}
                    beforeUpload={handleBeforeUpload}
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
              onClick={handleVideoProcess}
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
  playItem: state.playItem,
  playState: state.play,
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

  // 添加播放
  handleUpdatePlayItem: (data) => {
    dispatch({
      type: PlayAutoActions.AddPlayItem,
      data
    })
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(AutoPlay);
