import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Select, Empty, message, Upload } from 'antd';
import { CameraTwoTone, CloseCircleTwoTone } from '@ant-design/icons';

import utils from '@/utils';
import API from '@/services';
import action from '@/actions';
import yoyo from '@/assets/images/character_model_yoyo.png';
import './index.less';
import background_one_ver from '@/assets/images/background-1.png'
import background_two_ver from '@/assets/images/background-2.png'
import background_three_ver from '@/assets/images/background-3.png'
import background_four_ver from '@/assets/images/background-4.png'
import background_five_ver from '@/assets/images/background-5.png'

import background_one_hor from '@/assets/images/background-1-1.jpg'
import background_two_hor from '@/assets/images/background-2-2.png'
import background_three_hor from '@/assets/images/background-3-3.png'
import background_four_hor from '@/assets/images/background-4-4.png'
import background_five_hor from '@/assets/images/background-5-5.png'

const {
  type: { toString },
  validate: { validURL, isImage },
} = utils;
const {play: { stop, start }} = action;

// 竖向默认背景
const verBackgroundList = [
  {
    id: 999,
    image: background_one_ver
  },
  {
    id: 998,
    image: background_two_ver
  },
  {
    id: 997,
    image: background_three_ver
  },
  {
    id: 996,
    image: background_four_ver
  },
  {
    id: 995,
    image: background_five_ver
  }
]
// 横向默认背景
const horBackgroundList = [
  {
    id: 999,
    image: background_one_hor
  },
  {
    id: 998,
    image: background_two_hor
  },
  {
    id: 997,
    image: background_three_hor
  },
  {
    id: 996,
    image: background_four_hor
  },
  {
    id: 995,
    image: background_five_hor
  }
]

const AutoPlay = (props) => {
  const {playState, handlePlay} = props;
  const [options, setOptions] = useState([]);
  const [goodsList, setGoodsList] = useState([]);
  const [reverse, setReverse] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [goodsUrl, setGoodsUrl] = useState(localStorage.getItem('goodsUrl') || '');
  const [goodsWav, setGoodsWav] = useState(localStorage.getItem('goodsWav') || '');
  const localServerUrl = process.env.REACT_APP_LOCAL_SERVER_URL;
  const [defaultBackground, setDefaultImage] = useState();
  const [backgroundID, setBackgoundID] = useState(localStorage.getItem('id') || 996)
  const [bgImgList, setBackgroundList] = useState(verBackgroundList);

  // 获取商品列表
  const getGoodsList = async (id) => {
    let response = null;
    let data = {
      play_list_id: id,
      size: 999,
    };

    // 设loading加载效果
    setLoading(true);
    try {
      response = await API.autoPlayApi.getGoodsList(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
      response.data.content.forEach((option) => {
        option.label = option.name;
        option.value = option.id;
      });
      setOptions(response.data.content);
      setValue(response.data.content[0].label);
      // 设定初始值
      getGoodsList(response.data.content[0].id);
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
      let tempList = []
      if(reverse) {
        tempList = [...horBackgroundList]
      } else {
        tempList = [...verBackgroundList]
      }
      tempList.push(...response.data.content)
      setBackgroundList(tempList)
    }
  };

  // 通过 ws 连接视频处理服务器
  const connectVideoProcess = () => {
    const { localServerWsClient: client } = window;
    // 背景图
    let bg = validURL(defaultBackground) ? defaultBackground : `../build${defaultBackground}`;

    if (process.env.NODE_ENV !== 'development') {
      bg = validURL(defaultBackground)
        ? defaultBackground
        : `../app.asar.unpacked${defaultBackground}`;
    }

    // 背景图 和 清晰度
    const Initialize = 'start->' + toString({ bg, clarity: ' MEDIUM' });

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

      // 用于指定连接成功后的回调函数y
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
    console.log(goodsList)
    let data = goodsList.map((e) => ({
      action_tag_list: e.action_tag_list,
      word_list: e.word_list || null,
      video_url: e.video_url || null,
      speed_list: e.speed_list,
      wav_url_list: e.wav_url_list,
      image:e.image || null,
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
    console.log(data)
    client.send('sequence->' + toString(data));
  };

  // 选中新的的播放商品 && 根据选中的id获取新的商品
  const handleChange = (value) => {
    let good = options.find((opt) => value === opt.id);
    setValue(good.label);
    getGoodsList(value);
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
    let r = !reverse? (o.offsetWidth / o.offsetHeight / 10).toFixed(6) : (o.offsetHeight / o.offsetWidth / 10).toFixed(6)

    o.onmousewheel = function (e) {
      //获取图片的宽高
      const offsetWidth = o.offsetWidth;
      const offsetHeight = o.offsetHeight;
      if (e.wheelDelta > 0) {
        const setWidth = offsetWidth + offsetWidth * r;
        const setHeight = offsetHeight + offsetHeight * r

        o.style.width = setWidth + 'px'
        o.style.height = setHeight + 'px';

        // 竖屏状态下，图片的缩放宽度如果大于等于限制窗口的宽度，即不可以在放大，横屏则人物的缩放的高度如果大于等于窗口的高度，则不可在放大
        if(!reverse) {
          // 限宽
          if(setWidth >= c.offsetWidth) {
            o.style.width = c.offsetWidth + 'px'
            o.style.height = (c.offsetWidth / (r * 10)) + 'px'
          }
        } else {
          // 限高
          if(setHeight >= c.offsetHeight){
            o.style.height = c.offsetHeight + 'px'
            o.style.width = (c.offsetHeight / (r * 10)) + 'px'
          }
        }

        // 限制上下位置
        if(c.offsetHeight <= o.offsetHeight + o.offsetTop) {
          o.style.top = c.offsetHeight - o.offsetHeight + 'px'
        }

        // 限制左右位置
        if(c.offsetWidth <= o.offsetWidth + o.offsetLeft) {
          o.style.left = c.offsetWidth - o.offsetWidth + 'px'
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
  const handleUploadChange = async  ({ fileList, file }) => {
    if (file.status === 'done') {
      await API.autoPlayApi.addBackground({
        image: file?.response.data
      })
      getBackground()
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
      await API.autoPlayApi.deleteBackground(id);
    } catch (error) {
      message.error('删除失败！');
      return false;
    }
    getBackground()
  };

  // 横竖屏切换背景图
  useEffect( () => {
    getBackground()

    if (!reverse) {
      handleScale('goods-img', 'winVer');
      handleScale('person', 'winVer');
      setBackgroundList(verBackgroundList)
    } else {
      handleScale('goods-img', 'winHorizont');
      handleScale('person', 'winHorizont');
      setBackgroundList(horBackgroundList)
    }
  }, [reverse]);

  // 请求播放列表
  useEffect(()=>{
    getPlaylist()
  }, [])

  // 设定背景图
  useEffect(()=>{
    bgImgList.forEach(e => {
      if(e.id == backgroundID) {
        setDefaultImage(e.image)
      }
    })
  }, [bgImgList, backgroundID])

  // 关联直播按钮
  useEffect(()=>{
    if(!goodsUrl && !goodsWav) {
      localStorage.removeItem('goodsUrl')
      localStorage.removeItem('goodsWav')
    }
  },[goodsUrl, goodsWav])

  return (
    <div className='auto_play flex justify-between h-full overflow-hidden'>
      {/* 左 */}
      <div className='flex-1 rounded bg-white h-full'>
        <div className='border-b text-center mb-3 h_45 line_height_45'>
          直播列表
        </div>
        <div className='mb-3 flex justify-between px-3'>
          <Select
            defaultActiveFirstOption
            value={value}
            className='rounded-full flex-1 site-select'
            loading={loading}
            placeholder='请选择'
            options={options}
            onChange={handleChange}
          />
        </div>
        <div className='goods relative box-border pr-4 goods_h'>
          {goodsList.length > 0 ? (
            <div className='flex flex-wrap'>
              {goodsList.map((e, i) => {
                return (
                  <div
                    className='flex flex-col goods_item  w_80 ml-4 mb-4'
                    key={e.id}
                  >
                    { e.image && isImage(e.image[0]) ? (
                      <div
                        className='h_80 cursor-pointer rounded overflow-hidden'
                        onClick={() => {
                          setGoodsUrl(e.image[0]);
                          setGoodsWav('');
                          localStorage.setItem('goodsUrl', e.image[0])
                          localStorage.removeItem('goodsWav')
                        }}
                      >
                        <img
                          src={e.image[0]}
                          alt=''
                          className='rounded'
                        />
                      </div>
                    ) : (
                      <div
                        className='h_80 cursor-pointer rounded overflow-hidden'
                        onClick={() => {
                          setGoodsWav(e.video_url);
                          setGoodsUrl('');
                          localStorage.setItem('goodsWav', video_url)
                          localStorage.removeItem('goodsUrl')
                        }}
                      >
                        <video
                          src={e.video_url}
                          alt=''
                          className='rounded w-full h-full object-fit'
                        />
                      </div>
                    )}
                    <div className='text-overflow font_12 mt-1 px-1'>
                      {e.name}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <div className='absolute empty_icon'>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            </div>
          )}
        </div>
        <div className='bg_img_h'>
          <div className='border-b text-center mb-3 h_45 line_height_45'>
            背景图
          </div>
          <div className='flex flex-wrap'>
            {bgImgList.map((u, i) => {
              return (
                <div key={u.id}>
                  {i <= 8 && (
                    <div
                      className='w_80 ml-4 mb-4 border h_80 rounded  cursor-pointer relative'
                      onClick={() => {
                        setBackgoundID(u.id)
                        localStorage.setItem('id', u.id)
                      }}
                    >
                      <div className='w-full h-full rounded cursor-pointer overflow-hidden'>
                        <img src={u.image} alt='' className='h-full w-full'/>
                      </div>

                      {i > 4 && (
                        <div
                          className='absolute _top_7px _right_7px flex justify-center items-center z-50'
                          onClick={() => handleDeleteBackgound(u.id)}
                        >
                          <CloseCircleTwoTone twoToneColor='#ee6843'/>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {!(bgImgList.length >= 9) && (
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
        </div>
      </div>

      {/* 中 */}
      <div className='m_l_r_24 w_405  box-border'>
        <div className={['rounded relative flex-1 bg-white win_h '].join(' ')}>
          {!reverse ? (
            <div className='w-full relative winVer h-full'>
              <div className='play_window h-full rounded overflow-hidden'>
                <img src={defaultBackground} alt='' className='w-full h-full'/>
              </div>
              {/* 人物 */}
              <div className='absolute bottom-0 w-full h-full'>
                <img
                  src={yoyo}
                  alt=''
                  className='absolute top_calc w_35vh h_60vh person '
                  onDragStart={(e) => handleDragStart(e, 'person', 'winVer')}
                />
              </div>
              {/* 商品 */}
              <div
                className='absolute w_20vh h_20vh overflow-hidden goods-img goods rounded left_405-22 top_20vh'
                onDragStart={(e) => handleDragStart(e, 'goods-img', 'winVer')}
              >
                {goodsUrl && <img src={goodsUrl} alt='' />}
                {goodsWav && <video src={goodsWav} className='object-fill' />}
              </div>
            </div>
          ) : (
            <div className='w-full flex flex-col justify-center items-center relative'>
              <div
                className='w-full h_230 relative winHorizont overflow-hidden'
                style={{ backgroundSize: '100%, 100%' }}
              >
                <img src={defaultBackground} alt='' className='w-full h-full'/>
                {/* 人物 */}
                <img
                  src={yoyo}
                  alt=''
                  className='absolute bottom-0 left-10 w_100 person'
                  onDragStart={(e) =>
                    handleDragStart(e, 'person', 'winHorizont')
                  }
                />

                {/* 商品 */}
                <div
                  className='absolute h_13vh w_13vh overflow-hidden goods-img rounded left-0 top-4'
                  onDragStart={(e) =>
                    handleDragStart(e, 'goods-img', 'winHorizont')
                  }
                >
                  {goodsUrl && <img src={goodsUrl} alt='' />}
                  {goodsWav && <video src={goodsWav} className='object-fill' />}
                </div>
              </div>
            </div>
          )}
          <div
            className='font_12 color_FF8462 px-1 bg-001529 absolute right-0 top-2 rounded-l cursor-pointer'
            onClick={() => {
              setReverse((reverse) => !reverse);
            }}
          >
            {reverse ? '横屏' : '竖屏'}
          </div>
        </div>
        <div className='h_60px rounded bg-white mt_15px flex items-center justify-center px-4 box-border'>
          {goodsUrl || goodsWav ? (
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
