import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Empty, message } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';

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

import default_back_ground from '@/assets/bg-preview.jpg'
const {
  type: { toString, toObject },
  validate: { validURL, isImage },
} = utils;
const {
  play: { stop, start },
} = action;

// 竖向默认背景
const verBackgroundList = [
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
const horBackgroundList = [
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
  const { playState, handlePlay } = props;
  // 商品列表
  const [goodsList, setGoodsList] = useState([]);
  // 播放列表
  const [playList, setPlayList] = useState([]);
  // 横竖屏
  const [reverse, setReverse] = useState(false);
  // 选中要播放的商品
  const [goodsUrl, setGoodsUrl] = useState({});
  // ws
  const localServerUrl = process.env.REACT_APP_LOCAL_SERVER_URL;
  // 背景图
  const [backGround, setBackGround] = useState({});
  // 背景图列表
  const [backGroundList, setBackgroundList] = useState([]);
  // 放大缩小(false为小，true为大)
  const [zoom, setZoom] = useState(true);

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

  // 获取播放内容
  const getPlaylist = async () => {
    let response = null;
    try {
      response = await API.autoPlayApi.getPlaylist();
    } catch (error) {
      return false;
    }

    if (response && response.code === 200) {
      response.data.content.forEach((e) => {
        e.checked = false;
      });
      setPlayList(response.data.content);
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

  // 获取背景图
  const getBackground = async () => {
    let response = null;
    try {
      response = await API.autoPlayApi.getBackground();
    } catch (error) {
      return false;
    }

    if (response && response.code === 200) {
      let tempList = !reverse
        ? toString(verBackgroundList)
        : toString(horBackgroundList);
      let r = toObject(tempList);
      r.push(...response.data.content);
      setBackgroundList(r);
    }
  };

  // 通过 ws 连接视频处理服务器
  const connectVideoProcess = () => {
    const { localServerWsClient: client } = window;
    // 背景图
    // let bg = validURL(backGround) ? backGround : `../build${backGround}`;
    let bg = `../build${default_back_ground}`
    if (process.env.NODE_ENV !== 'development') {
      // bg = validURL(backGround)
      //   ? backGround
      //   : `../app.asar.unpacked${backGround}`;
      bg = `../app.asar.unpacked${default_back_ground}`;
    }

    // 背景图 和 清晰度
    const Initialize = 'start->' + toString({ bg, clarity: ' MEDIUM' });
    console.log(Initialize)
    if (client) {
      client.send(Initialize);
      sendGoodsToServe(client, goodsList);
    } else {
      const client = new W3CWebSocket(localServerUrl);
      // 用于指定连接失败后的回调函数
      client.onerror = (error) => {
        message.info({
          icon: <></>,
          top: 0,
          content: '服务连接失败，请检查网路！',
        });
      };

      // 用于指定连接成功后的回调函数
      client.onopen = () => {
        client.send(Initialize);
        sendGoodsToServe(client, goodsList);
        window.localServerWsClient = client;
      };

      // 用于指定连接关闭后的回调函数
      client.onclose = () => {
        handlePlay(stop());
        window.localServerWsClient = null;
      };

      // 接受信息
      client.onmessage = (event) => {
        console.log(event);
      };
    }
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
      resize: zoom,

      //   ? getGoodsPositions('goods-img', 'winVer').window
      //   : getGoodsPositions('goods-img', 'winHorizont').window,
      // product_resize: !reverse
      //   ? getGoodsPositions('goods-img', 'winVer').product_resize
      //   : getGoodsPositions('goods-img', 'winHorizont').product_resize,
      // avatar_resize: !reverse
      //   ? getPersonPositions('person', 'winVer')
      //   : getPersonPositions('person', 'winHorizont'),
    }));
    // console.log(data)
    client.send('sequence->' + toString(data));
  };

  // 选中播放
  const handleSelectPlays = (p, i) => {
    localStorage.setItem('plays', JSON.stringify(p));
    setGoodsUrl(p);

    playList.filter((e, v) => {
      e.checked = i === v;
      return e;
    });

    // 根据ID获取商品
    getGoodsList(p.id);
  };

  // 选中背景图
  const handleSelectBackGround = (u, i) => {
    setBackGround(u);
    localStorage.setItem('background', toString(u));

    backGroundList.filter((e, v) => {
      e.checked = i === v;
      return e;
    });
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
      await API.autoPlayApi.addBackground({
        image: file?.response.data,
      });
      getBackground();
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
  const handleDeleteBackgound = async (id) => {
    try {
      // res = await API.autoPlayApi.deleteBackground(id);
      await API.autoPlayApi.deleteBackground(id);
    } catch (error) {
      message.error('删除失败！');
      return false;
    }

    // let r = backGroundList.filter(e => e.id == id)
    localStorage.removeItem('background');
    setBackGround(backGroundList[3]);
    getBackground();
  };

  // 横竖屏切换
  const handleReverse = (bol) => {
    setReverse(!bol)
    localStorage.setItem('reverse', !bol)
  };

  // 横竖屏切换背景图
  // useEffect(() => {
  //   if (!reverse) {
  //     // 商品缩放
  //     handleScale('goods-img', 'winVer');
  //     // 人物缩放
  //     handleScale('person', 'winVer');
  //     // 背景图
  //     setBackgroundList(verBackgroundList)
  //   } else {
  //     // 商品缩放
  //     handleScale('goods-img', 'winHorizont');
  //     // 人物缩放
  //     handleScale('person', 'winHorizont');
  //     // 背景图
  //     setBackgroundList(horBackgroundList)
  //   }

  // }, [reverse]);

  // 请求播放列表
  useEffect(() => {
    getPlaylist();
    getBackground();
  }, []);

  useEffect(() => {
    if (playList.length) {
      let tempObj =
        localStorage.getItem('plays') &&
        toObject(localStorage.getItem('plays'));
      if (tempObj) {
        playList.filter((e) => {
          if (e.id === tempObj.id) {
            e.checked = true;
            setGoodsUrl(e);
            localStorage.setItem('plays', toString(e));
          }
          return e;
        });

        // 如果缓存的内容和数据没有对应上的则清除缓存
        if (!playList.some((e) => e.id === tempObj.id)) {
          localStorage.removeItem('zoom');
          localStorage.removeItem('plays');
        }
      }
    }
  }, [playList]);

  // 放大缩小
  useEffect(() => {
    let temp = localStorage.getItem('zoom');
    if (temp) {
      let zoom = temp === 'false' ? false : true;

      setZoom(zoom);
    }
  }, []);

  // 设定背景图
  // useEffect(() => {
  //   if (backGroundList) {
  //     let tempObj =
  //       localStorage.getItem('background') &&
  //       toObject(localStorage.getItem('background'));
  //     if (tempObj) {
  //       backGroundList.filter((e) => {
  //         e.checked = e.id === tempObj.id;
  //         if (e.id === tempObj.id) {
  //           setBackGround(e);
  //           localStorage.setItem('background', toString(e));
  //         }
  //         return e;
  //       });
  //     } else {
  //       setBackGround(backGroundList[3]);
  //     }
  //   }
  // }, [reverse, backGroundList]);

  useEffect(()=>{
    let temp = localStorage.getItem('reverse')
    if(temp) {
      setReverse(temp == 'false'? false : true)
    }
  }, [reverse])

  return (
    <div className='auto_play flex justify-between h-full overflow-hidden'>
      {/* 左  mb-3*/}
      <div className='flex-1 rounded bg-white h-full'>
        <div className='border-b text-center h_45 line_height_45'>直播列表</div>
        <div className='flex flex-wrap goods_h'>
          {!playList.length && (
            <div className=' m-auto'>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
          {playList.map((e, i) => {
            return (
              <div
                className='h_80 ml-4 mb-4 cursor-pointer relative mt-4'
                key={e.id}
                onClick={() => handleSelectPlays(e, i)}
              >
                <div className='w_80 h_80 overflow-hidden rounded'>
                  {isImage(e.cover_image) ? (
                    <img src={e.cover_image} alt='' />
                  ) : (
                    <video
                      src={e.cover_image}
                      className='object-fit h-full w-full'
                    />
                  )}
                </div>
                {e.checked && (
                  <div className='flex justify-center items-center absolute  z-30 _top_7px _right_7px'>
                    <CheckCircleTwoTone twoToneColor='#ff8462' />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* <div className='bg_img_h'>
          <div className='border-b text-center mb-3 h_45 line_height_45'>
            背景图
          </div>
          <div className='flex flex-wrap'>
            {backGroundList.map((u, i) => {
              return (
                <div key={u.id}>
                  {i <= 8 && (
                    <div
                      className='w_80 ml-4 mb-4 border h_80 rounded  cursor-pointer relative'
                      onClick={() => handleSelectBackGround(u, i)}
                    >
                      <div className='w-full h-full rounded cursor-pointer overflow-hidden'>
                        <img src={u.image} alt='' className='h-full w-full' />
                      </div>

                      {u.checked && (
                        <div className='flex justify-center items-center absolute  z-30 _top_7px _left_7px'>
                          <CheckCircleTwoTone twoToneColor='#ff8462' />
                        </div>
                      )}

                      {i > 4 && (
                        <div
                          className='absolute _top_7px _right_7px flex justify-center items-center z-50'
                          onClick={() => handleDeleteBackgound(u.id)}
                        >
                          <CloseCircleTwoTone twoToneColor='#ee6843' />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {!(backGroundList.length >= 9) && (
              <div className='w_80 ml-4 mb-4 border h_80 rounded overflow-hidden cursor-pointer self_bg_img'>
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
                      <p style={{ marginTop: '10px' }} className='font_12'>
                        上传背景
                      </p>
                    </div>
                  </div>
                </Upload>
              </div>
            )}
          </div>
        </div> */}
      </div>

      {/* 中 */}
      <div className='m_l_r_24 flex-1 box-border'>
        {/* 中心内容 */}
        <div
          className={[
            'rounded relative flex-1 bg-white flex flex-col  win_h',
          ].join(' ')}
        >
          {!reverse ? (
            <div className='w-full relative winVer flex-none rounded overflow-hidden h-full'>
              <div className='play_window h-full overflow-hidden'>
                <img src={default_back_ground} alt='' className='w-full h-full' />
              </div>
              {/* 人物 */}
              <div className='absolute bottom-0 w-full h-full'>
                <img
                  src={yoyo}
                  alt=''
                  className='absolute top_calc w_35vh h_60vh person'
                  // onDragStart={(e) => handleDragStart(e, 'person', 'winVer')}
                />
              </div>
              {/* 商品 */}

              {zoom ? (
                <div
                  className='absolute w_20vh h_20vh overflow-hidden goods-img goods rounded right-8 top_20vh'
                  // onDragStart={(e) => handleDragStart(e, 'goods-img', 'winVer')}
                >
                  {goodsUrl &&
                    (isImage(goodsUrl.cover_image) ? (
                      <img src={goodsUrl.cover_image} alt='' />
                    ) : (
                      <video
                        src={goodsUrl.cover_image}
                        className='object-fill'
                      />
                    ))}
                </div>
              ) : (
                <div
                  className='absolute w-full h_200px top-0 left-0'
                  // onDragStart={(e) => handleDragStart(e, 'goods-img', 'winVer')}
                >
                  {goodsUrl &&
                    (isImage(goodsUrl.cover_image) ? (
                      <img src={goodsUrl.cover_image} alt='' />
                    ) : (
                      <video
                        src={goodsUrl.cover_image}
                        className='object-fill'
                      />
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className='w-full flex flex-col justify-center items-center relative mt-56'>
              <div
                className='w-full h_400px relative winHorizont overflow-hidden'
                style={{ backgroundSize: '100%, 100%' }}
              >
                <img src={default_back_ground} alt='' />
                {/* 人物 */}
                <img
                  src={yoyo}
                  alt=''
                  className='absolute bottom-0 left-10 h-full person'
                  // onDragStart={(e) =>
                  //   handleDragStart(e, 'person', 'winHorizont')
                  // }
                />

                {/* 商品 */}
                {zoom ? (
                  <div
                    className='absolute h_20vh w_20vh overflow-hidden goods-img rounded right-20 top-8'
                    // onDragStart={(e) =>
                    //   handleDragStart(e, 'goods-img', 'winHorizont')
                    // }
                  >
                    {goodsUrl &&
                      (isImage(goodsUrl.cover_image) ? (
                        <img src={goodsUrl.cover_image} alt='' />
                      ) : (
                        <video
                          src={goodsUrl.cover_image}
                          className='object-fill'
                        />
                      ))}
                  </div>
                ) : (
                  <div
                    className='absolute h_35vh w_35vh overflow-hidden goods-img rounded right-4 top-6'
                    // onDragStart={(e) =>
                    //   handleDragStart(e, 'goods-img', 'winHorizont')
                    // }
                  >
                    {goodsUrl &&
                      (isImage(goodsUrl.cover_image) ? (
                        <img src={goodsUrl.cover_image} alt='' />
                      ) : (
                        <video
                          src={goodsUrl.cover_image}
                          className='object-fill'
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            className='font_12 color_FF8462 px-1 bg-001529 absolute right-0 top-2 rounded-l cursor-pointer'
            // onClick={() => {
            //   setReverse((reverse) => !reverse);
            //   localStorage.setItem()
            // }}
            onClick={()=>handleReverse(reverse)}
          >
            {reverse ? '横屏' : '竖屏'}
          </div>
        </div>

        {/* 按钮 */}
        <div className='h_60px rounded bg-white mt_15px flex items-center px-6 box-border justify-between'>
          {!Object.keys(goodsUrl).length ? (
            <button className='color_333'>缩小-</button>
          ) : (
            <>
              {zoom ? (
                <button className='color_333'>缩小-</button>
              ) : (
                <button
                  onClick={() => {
                    localStorage.setItem('zoom', true);
                    setZoom(true);
                  }}
                >
                  缩小-
                </button>
              )}
            </>
          )}
          {Object.keys(goodsUrl).length ? (
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
          {!Object.keys(goodsUrl).length ? (
            <button className='color_333'>+放大</button>
          ) : (
            <>
              {!zoom ? (
                <button className='color_333'>+放大</button>
              ) : (
                <button
                  onClick={() => {
                    localStorage.setItem('zoom', false);
                    setZoom(false);
                  }}
                >
                  +放大
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 右 */}
      <div className='flex-1 rounded bg-white'>
        <div className='border-b text-center mb-3 h_45 line_height_45'>
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
  playState: state.play,
});

const mapDispatchToProps = (dispatch) => ({
  handlePlay: (actions) => {
    dispatch(actions);
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(AutoPlay);
