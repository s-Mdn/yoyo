import React from 'react';
import { Tabs, message } from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  RedoOutlined,
  AudioTwoTone,
  CheckCircleTwoTone,
  SyncOutlined,
} from '@ant-design/icons';
import { validate } from '@/utils';

import Modal from '@/components/Modal';
import Content from './component/Content';
import API from '@/services';
import './index.less';

const { isImage } = validate;
class GoodsManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goodsList: [], // 商品列表
      playList: [], // 播放列表
      tabActive: '1', // 激活的卡片
      modelTitle: '', // Model标题
      modelVisible: false, // Model显示状态
      modelWidth: '400px', // Model宽度
      bodyStyle: { height: 'auto', textAlign: 'center', padding: '10px' }, // Model的中间内容样式
      goods: {}, // 商品
      modalItem: {},
      reLoad: false, // 刷新
      isViewGoods: false, // 查看商品
      imgList: [],
    };
  }

  // 编辑商品
  handleGoodsEdit = (goods) => {
    if (goods.status === 'f') {
      message.info('语音合成中，无法进行操作！', 0.5);
      return;
    }
    if( goods.status === 'z' ) {
      message.info('该商品直播中，无法编辑！', 0.5);
      return;
    }

    this.props.history.push({
      pathname: `/goods/${goods.id}`,
      query: { goods, isAdd: false },
    });
  };

  // 删除商品
  handleGoodsDelete = (goods) => {
    console.log( goods )
    if (goods.status === 'f') {
      message.info('语音合成中，无法进行操作！');
      return;
    } else if (goods.status === 'z') {
      message.info('正在播放，无法删除！');
      return;
    }else {
      this.setState({
        isViewGoods: false,
        modalItem: goods,
        modelVisible: true,
        modelTitle: '删除商品',
      });
    }
  };

  // 编辑播放列表
  handlePlaysEdit = (play) => {
    if(play.status === 'z') {
      message.info('该商品直播中，无法编辑！', 0.5);
      return;
    }
    this.props.history.push({
      pathname: `/plays/${play.id}`,
      query: { id: play.id, goodsName: play.name },
    });
  };

  // 播放列表删除
  handlePlaysDelete = (play) => {
    console.log( play )
    if( play.status === 'z' ) {
      message.info('正在播放，无法删除！');
      return;
    }
    this.setState({
      modelVisible: true,
      modalItem: play,
      isViewGoods: false,
      modelTitle: '删除播放',
    });
  };

  // 查看播放item的商品
  handlePlayView = async (play) => {
    let response = null;
    try {
      response = await API.goodsManageApi.viewGoods({ id: play.id });
    } catch (error) {
      message.error('查看失败！');
      return false;
    }
    if (response && response.code === 200) {
      let imgList = [];
      response.data.forEach((e) => {
        if (e.video_url) {
          imgList.push(e.video_url);
        } else {
          imgList.push(...e.image);
        }
      });
      this.setState({
        modelVisible: true,
        isViewGoods: true,
        modalItem: play,
        imgList,
        modelTitle: play.name
      });
    }
  };

  // Tabs切换
  handleTabChange = (activeKey) => {
    localStorage.setItem('tabActive', activeKey)
    this.setState({ tabActive: activeKey });
  };

  // 刷新
  handleReLoad = () => {
    this.setState({ reLoad: true });
    this.getGoodsAndPlaylist();
  };

  // 弹窗点击确定回调
  handleOk = async () => {
    if( this.state.isViewGoods ){
      this.setState({
        isViewGoods: false,
        modelVisible: false,
      })
      return false
    }
    const { modalItem, tabActive } = this.state;
    let response = null;
    try {
      if (tabActive === '1') {
        response = await API.goodsManageApi.deleteGoods(modalItem.id);
      } else {
        response = await API.goodsManageApi.deletePlay(modalItem.id);
      }
    } catch (error) {
      message.error('删除失败！');
      return false;
    }

    if (response && response.code === 200) {
      this.getGoodsAndPlaylist();
      this.setState({ modelVisible: false, isViewGoods: false });
    }
  };

  // 取消
  handleCancel = () => {
    this.setState({
      modelVisible: false,
      isViewGoods: false,
      modalItem: {},
      imgList: []
    })
  }

  // 商品 && 播放列表请求
  getGoodsAndPlaylist = async () => {
    let response = null;
    try {
      response = await Promise.all([
        API.goodsManageApi.getGoodsList(),
        API.goodsManageApi.getPlaylist(),
      ]);
    } catch (error) {
      message.error('获取失败，请刷新重试！');
      return false;
    }

    if (response && response.length > 0) {
      this.setState({
        reLoad: false,
        goodsList: response[0].data.content,
        playList: response[1].data.content,
      });
    }
  };

  // 生命周期
  componentDidMount() {
    this.getGoodsAndPlaylist();
    const tabActive = localStorage.getItem('tabActive')
    if( tabActive ) {
      this.setState({tabActive})
    }
  }

  render() {
    const {
      bodyStyle,
      modelWidth,
      modelTitle,
      modelVisible,
      reLoad,
      playList,
      goodsList,
      modalItem,
      tabActive,
      isViewGoods,
      imgList,
    } = this.state;
    const { history } = this.props;

    // 商品列表
    const Goods = (g) => {
      return (
        <>
          {g.image && isImage(g.image[0]) ? (
            <img src={g.image[0]} alt='' className='w-full h-full object-fit' />
          ) : (
            <video className='w-full h-full object-fit' src={g.video_url} />
          )}
          <div className='absolute left-0 top-0 z-10'>
            {g.status === 'f' ? (
              <div className='flex items-center ml_3 mt-1'>
                <AudioTwoTone twoToneColor='#ff8462' />
                <span className='font_12 color-ee6843'>语音合成中....</span>
              </div>
            ) : (
              <div className=' flex items-center ml_3 mt-1'>
                <CheckCircleTwoTone twoToneColor='#ff8462' />
              </div>
            )}
          </div>
          {
            (g.status === 'z') && (
              <div className='absolute left-0 top-0 z-10 color-ee6843 font_12'>直播中...</div>
            )
          }
        </>
      );
    };

    // 播放列表
    const Plays = (p) => {
      return (
        <>
          {isImage(p.cover_image) ? (
            <img src={p.cover_image} alt='' className='w-full h-full object-fit' />
          ) : (
            <video className='object-fit h-full' src={p.cover_image} />
          )}
          {
            (p.status === 'z') && (<div className='absolute left-0 top-0 z-10 color-ee6843 font_12'>直播中...</div>)
          }
          {
            <div className='absolute right-1 top-0 z-10 color-ee6843 font_12'>{p.commodity_total}件</div>
          }
        </>
      );
    };

    return (
      <div className='box-border goodsmanage overflow-hidden'>
        <div className='pb-6 pt-4 pl-6 pr-6 bg-white rounder relative goodsmanage_h_full box-border'>
          <Tabs onChange={this.handleTabChange}  activeKey={tabActive}>
            <Tabs.TabPane tab='所有商品' key='1'>
              <Content
                isView={false}
                content={goodsList}
                childrenNode={Goods}
                handleDelete={this.handleGoodsDelete}
                handleEdit={this.handleGoodsEdit}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab='直播列表' key='2'>
              <Content
                isView={true}
                content={playList}
                childrenNode={Plays}
                handleView={this.handlePlayView}
                handleDelete={this.handlePlaysDelete}
                handleEdit={this.handlePlaysEdit}
              />
            </Tabs.TabPane>
          </Tabs>

          {/* 右上角新增和刷新 */}
          <div className='absolute z-10 _top right-6 flex'>
            <div
              className='border flex items-center py-0.5 px-4 rounded cursor-pointer reload'
              onClick={this.handleReLoad}
            >
              {!reLoad ? <RedoOutlined /> : <SyncOutlined spin />}
            </div>
            {tabActive === '1' ? (
              <div
                className='border flex items-center py-0.5 px-4 rounded cursor-pointer ml-3'
                onClick={() =>{
                  localStorage.setItem('tabActive', tabActive)
                  history.push({ pathname: '/goods', query: { isAdd: true } })
                }}
              >
                新增
              </div>
            ) : (
              <div
                className='border flex items-center py-0.5 px-4 rounded cursor-pointer ml-3'
                onClick={()=>{
                  localStorage.setItem('tabActive', tabActive)
                  history.push({ pathname: '/plays'})
                }}
              >
                新增
              </div>
            )}
          </div>
        </div>

        <Modal
          title={modelTitle}
          visible={modelVisible}
          width={modelWidth}
          bodyStyle={bodyStyle}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
        >
          {
            (tabActive === '1')?(
              (modalItem.video_url)?(
                <div className='w_80 h_80 overflow-hidden m-auto my-2'>
                  <video src={modalItem.video_url} className='object-fit w-full h-full' />
                </div>
              ):(
                <div className='flex flex-wrap _ml_5px'>
                  {
                    modalItem?.image?.map((e, i)=>(
                      <div key={i} className='w_80 h_80 overflow-hidden ml_20px mb_20px rounded'>
                        <img src={e} alt='' className='w-full h-full object-fit' />
                      </div>
                    ))
                  }
                </div>
              )
            ):(
              <>
                {
                  (!isViewGoods)?(
                    <div className='w_80 h_80 overflow-hidden m-auto my-2'>
                      {
                        isImage(modalItem.cover_image)?(
                          <img src={modalItem.cover_image} alt='' className='object-fit w-full h-full' />
                        ):(
                          <video src={modalItem.cover_image} className='object-fit w-full h-full' />
                        )
                      }
                    </div>
                  ):(
                    <div className='flex flex-wrap _ml_5px'>
                      {
                        imgList.map((e, i)=>(
                          <div key={i} className='w_80 h_80 overflow-hidden ml_20px mb_20px rounded'>
                            {
                              (isImage(e))?(
                                <img src={e} alt='' className='w-full h-full object-fit'/>
                              ):(
                                <video src={e} className='w-full h-full object-fit' />
                              )
                            }
                          </div>
                        ))
                      }
                    </div>
                  )
                }
              </>
            )
          }
          {
            isViewGoods && (
              <div className='absolute top-0 left-0 text-white font_12'>
                {
                  (modalItem.status === 'z') && <span className='color-ee6843'>直播中...</span>
                }
              </div>
            )
          }
          {
            !isViewGoods && (<div>{modalItem.name}</div>)
          }
        </Modal>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({});
const mapStateToProps = (state) => ({});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(GoodsManage)
);
