import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Select, Empty, message, Upload } from 'antd';
import { CameraTwoTone } from '@ant-design/icons';

import utils from '@/utils';
import API from '@/services';
import action from '@/actions';
import defaultBgImage from '@/assets/images/backgroundImg.jpg';
import yoyo from '@/assets/images/character_model_yoyo.png';
import './index.less';

const {
  type: { toString },
} = utils;
const {
  play: { stop, start },
} = action;
const AutoPlay = (props) => {
  const [options, setOptions] = useState([]);
  const [goodsList, setGoodsList] = useState([]);
  const [reverse, setReverse] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [goodsUrl, setGoodsUrl] = useState('');
  const [goodsWav, setGoodsWav] = useState('');
  const [bgImg, setBgImg] = useState('');
  const localServerUrl = process.env.REACT_APP_LOCAL_SERVER_URL;
  const { playState, handlePlay } = props;
  const [defaultImage, setdefaultImage] = useState(defaultBgImage);
  const [bgImgList] = useState([yoyo, defaultBgImage]);

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

    if (response && response.code === 200 && response.data.length > 0) {
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

    if (response && response.code === 200 && response.data.content.length > 0) {
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
    const o = document.getElementsByClassName(dom)[0];
    const c = document.getElementsByClassName(winDom)[0];
    const size = {
      window: {
        w: c.offsetWidth,
        h: c.offsetHeight,
      },
      product_resize: {
        w: o.offsetWidth,
        h: o.offsetHeight,
        x1: o.offsetLeft,
        y1: o.offsetTop,
        x2: c.offsetWidth - o.offsetLeft,
        y2: c.offsetHeight - o.offsetTop,
      },
    };
    return size;
  };

  // 获取人物位置和尺寸
  const getPersonPositions = (dom, winDom) => {
    const o = document.getElementsByClassName(dom)[0];
    const c = document.getElementsByClassName(winDom)[0];
    return {
      w: o.offsetWidth,
      h: o.offsetHeight,
      x1: o.offsetLeft,
      y1: o.offsetTop,
      x2: c.offsetWidth - o.offsetLeft,
      y2: c.offsetHeight - o.offsetTop,
    };
  };

  // 通过 ws 连接视频处理服务器
  const connectVideoProcess = () => {
    const { localServerWsClient: client } = window;
    // 背景图
    let bg = `../build${defaultImage}`;
    if (process.env.NODE_ENV !== 'development') {
      bg = `../app.asar.unpacked${defaultImage}`;
    }

    // 背景图 和 清晰图
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
    let data = goodsList.map((e) => ({
      action_tag_list: e.action_tag_list,
      word_list: e.word_list || null,
      video_url: e.video_url || null,
      speed_list: e.speed_list,
      wav_url_list: e.wav_url_list,
      image: e.image,
      is_landscape: reverse,
      resize: false,
      window: getGoodsPositions().window,
      product_resize: !reverse
        ? getGoodsPositions('goods-img', 'winVer').product_resize
        : getGoodsPositions('goods-img', 'winHorizont').product_resize,
      avatar_resize: !reverse
        ? getPersonPositions('person', 'winVer')
        : getPersonPositions('person', 'winHorizont'),
    }));
    data.push({
      is_landscape: reverse,
    });
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
      getGoodsPositions();
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
    console.log(c, o);
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

    o.onmousewheel = function (e) {
      //获取图片的宽高
      const offsetWidth = o.offsetWidth;
      const offsetHeight = o.offsetHeight;

      if (e.wheelDelta > 0) {
        const setWidth = offsetWidth + offsetWidth * 0.05;
        const setHeight = offsetHeight + offsetHeight * 0.05;

        // 限制最大缩放
        if (setWidth < c.offsetWidth) {
          // 横屏状态的高度处理
          if (!reverse && o.offsetHeight >= c.offsetHeight) {
            o.style.width = o.style.width;
          } else {
            o.style.width = setWidth + 'px';
          }

          o.style.height = setHeight + 'px';
        } else {
          o.style.width = c.offsetWidth + 'px';
        }

        // 横向模式下高度不能超过容器的高度
        if (!reverse && o.offsetHeight >= c.offsetHeight) {
          o.style.height = c.offsetHeight + 'px';
        }

        // 限制横向不能超出位置
        if (o.offsetLeft + o.offsetWidth >= c.offsetWidth) {
          o.style.left = c.offsetWidth - o.offsetWidth + 'px';
        }

        // 限制竖向不超出范围
        if (o.offsetTop + o.offsetHeight >= c.offsetHeight) {
          o.style.top = c.offsetHeight - o.offsetHeight + 'px';
        }
      } else {
        o.style.width = offsetWidth - offsetWidth * 0.05 + 'px';
        o.style.height = offsetHeight - offsetHeight * 0.05 + 'px';
      }
    };
  };

  // 上传先钩子函数
  const handleBeforeUpload1 = (file) => {
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
  const handleUploadChange = ({ fileList, file }) => {
    setBgImg(file.response?.data)

  };

  useEffect(() => {
    getPlaylist();
    console.log(defaultImage);
  }, []);

  // 涉及到dom操作的部分
  useEffect(() => {
    if (reverse) {
      handleScale('goods-img', 'winVer');
      handleScale('person', 'winVer');
    } else {
      handleScale('goods-img', 'winHorizont');
      handleScale('person', 'winHorizont');
    }
  }, [reverse]);

  return (
    <div className='auto_play flex justify-between h-full overflow-hidden'>
      {/* 左 */}
      <div className='flex-1 rounded bg-white h-full'>
        <div className='border-b text-center mb-3 h_45 line_height_45'>
          直播列表
        </div>
        <div className='mb-3 flex justify-between px-3 w_210_'>
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
              {goodsList.map((good) => {
                return (
                  <div
                    className='flex flex-col goods_item  w_80 ml-4 mb-4'
                    key={good.id}
                  >
                    {good.image?.length ? (
                      <div
                        className='h_80 cursor-pointer rounded overflow-hidden'
                        onClick={() => {
                          setGoodsUrl(good.image && good.image[0]);
                        }}
                      >
                        <img
                          src={good.image && good.image[0]}
                          alt=''
                          className='rounded'
                        />
                      </div>
                    ) : (
                      <div
                        className='h_80 cursor-pointer rounded overflow-hidden'
                        onClick={() => {
                          setGoodsWav(good.video_url);
                        }}
                      >
                        <video
                          src={good.video_url}
                          alt=''
                          className='rounded w-full h-full object-fit'
                        />
                      </div>
                    )}
                    <div className='text-overflow font_12 mt-1 px-1'>
                      {good.name}
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
          <div className='flex flex-wrap  '>
            {bgImgList.map((u) => {
              return (
                <div
                  className='w_80 ml-4 mb-4 border h_80 rounded overflow-hidden'
                  key={u}
                  onClick={(e) => setdefaultImage(u)}
                >
                  <img src={u} />
                </div>
              );
            })}
            <div className='w_80 ml-4 mb-4 border h_80 rounded overflow-hidden cursor-pointer self_bg_img'>
              <Upload
                beforeUpload={handleBeforeUpload1}
                onChange={handleUploadChange}
                action={`${process.env.REACT_APP_API}/api/common/upload`}
                accept='.jpg, .png, .gif, .webp'
              >
                <div className='relative w-full h-full '>
                  {bgImg ? (
                    <>
                      <img className='h-full' src={bgImg}/>
                      <div className='absolute top-0 left-0 z-10 w-full h-full rounded text-center hidden pt-4 box-border hover'>
                        <CameraTwoTone twoToneColor='rgba(0, 0, 0, 0.4)' />
                        <p style={{ marginTop: '10px', color: 'rgba(0, 0, 0, 0.4)' }}>
                          更改背景
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='absolute top-0 left-0 z-10 w-full h-full rounded text-center mt-4'>
                        <CameraTwoTone twoToneColor='#000' />
                        <p style={{ marginTop: '10px' }} className='font_12'>
                          上传背景
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Upload>
            </div>
          </div>
        </div>
      </div>

      {/* 中 */}
      <div className='m_l_r_24 w_505 flex-1 box-border flex flex-col'>
        <div className={['rounded relative flex-1 bg-white'].join(' ')}>
          {!reverse ? (
            <div className='w-full h-full relative winVer'>
              <div className='play_window h-full rounded overflow-hidden'>
                <img src={defaultImage} />
              </div>
              {/* 人物 */}
              <div className='absolute bottom-0 w-full h-full'>
                <img
                  src={yoyo}
                  alt=''
                  className='absolute top_calc w_35vh h_60vh person'
                  onDragStart={(e) => handleDragStart(e, 'person', 'winVer')}
                />
              </div>

              {/* 商品 */}
              <div
                className='absolute w_20vh h-auto overflow-hidden goods-img goods rounded left_505-20 top_20vh'
                onDragStart={(e) => handleDragStart(e, 'goods-img', 'winVer')}
              >
                {goodsUrl && <img src={goodsUrl} alt='' />}
                {goodsWav && <video src={goodsWav} className='object-fill' />}
              </div>
            </div>
          ) : (
            <div className='w-full h-full flex flex-col justify-center relative'>
              <div
                className='w-full h_284 play_window relative winHorizont'
                style={{ backgroundSize: '100%, 100%' }}
              >
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
        <div className='play_contron h_80 rounded bg-white mt-4 flex items-center justify-center px-4 box-border'>
          {goodsUrl ? (
            <button
              className='bg-FF8462 px-6 py-2 rounded-full text-white'
              onClick={handleVideoProcess}
            >
              {!playState ? <span>开始直播</span> : <span>关闭直播</span>}
            </button>
          ) : (
            <button className='bg_CCC px-6 py-2 rounded-full text-white'>
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
