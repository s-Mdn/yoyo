import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Select, Empty, message } from 'antd';
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
  const localServerUrl = process.env.REACT_APP_LOCAL_SERVER_URL;
  const { playState, handlePlay } = props;

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

  // 通过 ws 连接视频处理服务器
  const connectVideoProcess = () => {
    const { localServerWsClient: client } = window;

    // 背景图
    let bg = `../build${defaultBgImage}`;
    if (process.env.NODE_ENV !== 'development') {
      bg = `../app.asar.unpacked${defaultBgImage}`;
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
    }));
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

  // 商品拖动
  const handleDragStart = (e) => {
    const o = document.getElementsByClassName('goods-img')[0]
    const c = document.getElementsByClassName('center')[0]
    const s = o.style
    const x = e.clientX - o.offsetLeft
    const y = e.clientY - o.offsetTop
    document.onmousemove = function(e) {
      s.left = e.clientX - x + 'px';
      s.top = e.clientY - y + 'px';
    }
    document.onmouseup = function () {
      document.onmousemove = null
    }
  }

  // 阻止默认拖动事件
  const handleStopDrag = (e) => {
    e.preventDefault()
  }

  useEffect(() => {
    getPlaylist();
  }, []);

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
                    <div className='h_80 cursor-pointer rounded overflow-hidden'>
                      <img src={good.image[0]} alt='' className='rounded' />
                    </div>
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
      </div>

      {/* 中 */}
      <div
        className='m_l_r_24 w_300 flex-1 box-border flex flex-col center'
        style={{
          maxWidth: '500px',
          width: '300px',
          minWidth: '300px',
        }}
      >
        <div
          className={[
            'rounded relative flex-1 bg-white',
          ].join(' ')}
        >
          {/* 背景 */}
          <div className='play_window h-full rounded' />
          {/* 人物 */}
          <div className='absolute bottom-0 -left_40 w_7_100 overflow-hidden'>
            <img src={yoyo} alt='' />
          </div>
          {/* 商品 */}
          <div
            className='absolute w_2vw h_2vw overflow-hidden goods-img bg-black'
            style={{ right: 0, top: '20vh' }}
            onDragStart={handleDragStart}
            onDragEnd={handleStopDrag}
          >
            <img src={yoyo} alt='' className='w-full h-full' />
          </div>
          <div
            className='font_12 color_FF8462 px-1 bg-001529 absolute right-0 top-2 rounded-l cursor-pointer'
            onClick={() => setReverse((reverse) => !reverse)}
          >
            {reverse ? '横屏' : '竖屏'}
          </div>
        </div>
        <div className='play_contron h_80 rounded bg-white mt-4 flex items-center justify-center px-4 box-border'>
          <button
            className='bg-FF8462 px-6 py-2 rounded-full text-white'
            onClick={handleVideoProcess}
          >
            {!playState ? <span>开始直播</span> : <span>关闭直播</span>}
          </button>
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
