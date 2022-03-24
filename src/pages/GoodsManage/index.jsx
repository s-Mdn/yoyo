import React from 'react';
import { Tabs, Empty, message } from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  RedoOutlined,
  AudioTwoTone,
  CheckCircleTwoTone,
  SyncOutlined
} from '@ant-design/icons';
import Modal from '@/components/Modal'
import API from '@/services';
import utils from '@/utils';
import './index.less';

const { TabPane } = Tabs;
const {validate: { isImage }} = utils;

class GoodsManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goodsList: [], // 商品列表
      playList: [], // 播放列表
      tabActive: '1', // 激活的卡片
      modelTitle: '',// Model标题
      modelVisible: false,// Model显示状态
      modelWidth: '400px', // Model宽度
      modelContent: '', // Model文本
      bodyStyle: {height: 'auto', textAlign: 'center', padding: '10px' },// Model的中间内容样式
      goodsId: '',//商品ID
      playId: '',// 播放ID
      reLoad: false,// 刷新
    };
  }

  // 编辑商品
  handleGoodsEdit = (goods) => {
    if(goods.status === 'f') {
      message.info('语音合成中，无法进行操作！');
      return
    }

    this.props.history.push({
      pathname: `/goods/${goods.id}`,
      query: { goods, isAdd: false },
    });
  };

  // 删除商品
  handleGoodsDelete = (goods) => {
    if(goods.status === 'f') {
      message.info('语音合成中，无法进行操作！');
      return
    } else {
      this.setState({
        modelVisible: true,
        goodsId: goods.id,
        modelContent: '确定删除该商品？'
      })
    }
  };

  // 编辑播放列表
  handlePlaysEdit =  (play) => {
    this.props.history.push({
      pathname: `/plays/${play.id}`,
      query: { id: play.id, goodsName: play.name }
    })
  };

  // 播放列表删除
  handlePlaysDelete = (play) => {
    this.setState({
      modelVisible: true,
      playId: play.id,
      modelContent: '确定删除该播放？'
    })
  };

  // Tabs切换
  handleTabChange = (activeKey) => {
    this.setState({ tabActive: activeKey });
  };

  // 刷新
  handleReLoad = () => {
    this.setState({reLoad: true})
    this.getGoodsAndPlaylist();
  };

  // 弹窗点击确定回调
  handleOk = async () => {
    const { goodsId, playId, activeKey } = this.state
    let response = null

    try {
      if( activeKey === '1' ) {
        response = await API.goodsManageApi.deleteGoods(goodsId)
      } else {
        response = await API.goodsManageApi.deletePlay(playId)
      }
    } catch (error) {
      message.error('删除失败！')
      return false
    }

    if(response && response.code === 200) {
      this.getGoodsAndPlaylist();
      this.setState({modelVisible: false})
    }
  };

  // 商品 && 播放列表请求
  getGoodsAndPlaylist = async () => {
    let response = null;
    try {
      response = await Promise.all([
        API.goodsManageApi.getGoodsList(),
        API.goodsManageApi.getPlaylist(),
      ]);
    } catch (error) {
      message.error('获取失败，请刷新重试！')
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
  }

  render() {
    const { bodyStyle, modelWidth, modelTitle, modelVisible, reLoad, playList, goodsList, modelContent } = this.state
    const { history } = this.props
    return (
      <div className='box-border goodsmanage overflow-hidden'>
        <div className='pb-6 pt-4 pl-6 pr-6 bg-white rounder relative goodsmanage_h_full box-border'>
          <Tabs onChange={this.handleTabChange} defaultActiveKey='1'>
            <TabPane tab='所有商品' key='1'>
              <div
                className={[
                  'good_list_wrap_h_full',
                  goodsList.length && '-ml-12',
                ].join(' ')}
              >
                {goodsList.length > 0 ? (
                  <div className='flex flex-wrap'>
                    {goodsList.map((goods) => {
                      return (
                        <div
                          className='flex flex-col goods_item w_100 ml-12 mb-12 cursor-pointer rounded'
                          key={goods.id}
                        >
                          {/* 图片或者视频 */}
                          <div className='relative goods_item__hover w_100 h_100 overflow-hidden border box-border rounded'>
                            {goods.image ? (
                              <img
                                src={goods.image[0]}
                                alt=''
                              />
                            ) : (
                              <div className='w_100 h_100 rounded overflow-hidden  border box-border'>
                                <video
                                  src={goods.video_url}
                                  className='w-full h-full object-fit'
                                />
                              </div>
                            )}

                            {/* 语音合成中或合成成功状态 */}
                            <div className='absolute left-0 top-0 z-10'>
                              {goods.status === 'f' ? (
                                <div className=' flex items-center ml_3 mt-1'>
                                  <AudioTwoTone twoToneColor='#ff8462' />
                                  <span className='font_12 color-ee6843'>
                                    语音合成中....
                                  </span>
                                </div>
                              ) : (
                                <div className=' flex items-center ml_3 mt-1'>
                                  <CheckCircleTwoTone twoToneColor='#ff8462' />
                                </div>
                              )}
                            </div>

                            {/* 删除 和 编辑 */}
                            <div className='absolute hidden justify-between font_12 w-full bottom-0 text-white bg-FF8462 opacity-60 edit'>
                              <span
                                className='text-center flex-1 h-full'
                                onClick={(e) => this.handleGoodsEdit(goods)}
                              >
                                编辑
                              </span>
                              <span
                                className='text-center flex-1 h-full'
                                onClick={(e) => this.handleGoodsDelete(goods)}
                              >
                                删除
                              </span>
                            </div>
                          </div>
                          <div className='font_12 mt-3 px-1'>
                            <div className='text-overflow text-center'>{goods.name}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className='mt-20'>
                    <Empty />
                  </div>
                )}
              </div>
            </TabPane>
            <TabPane tab='播放列表' key='2'>
              <div
                className={[
                  'good_list_wrap_h_full',
                  playList.length && '-ml-12',
                ].join(' ')}
              >
                {playList.length > 0 ? (
                  <div className='flex flex-wrap'>
                    {playList.map((play) => {
                      return (
                        <div
                          className='flex flex-col goods_item w_100 ml-12 mb-12 cursor-pointer rounded'
                          key={play.id}
                        >
                          <div className='relative goods_item__hover w_100 h_100 overflow-hidden border box-border rounded'>
                            {
                              isImage(play.cover_image)?(<img src={play.cover_image} alt=''/>) : (<video className='object-fit h-full' src={play.cover_image}/>)
                            }
                            <div className='absolute hidden justify-between font_12 w-full bottom-0 text-white bg-FF8462 opacity-60 edit'>
                              <span
                                className='text-center flex-1'
                                onClick={(e) => this.handlePlaysEdit(play)}
                              >
                                编辑
                              </span>
                              <span
                                className='text-center flex-1'
                                onClick={(e) => this.handlePlaysDelete(play)}
                              >
                                删除
                              </span>
                            </div>
                          </div>
                          <div className='font_12 mt-3 px-1'>
                            <div className='text-overflow text-center'>{play.name}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className='mt-20'>
                    <Empty />
                  </div>
                )}
              </div>
            </TabPane>
          </Tabs>

          <div className='absolute z-10 _top right-6 flex'>
            <div
              className='border flex items-center py-0.5 px-4 rounded cursor-pointer reload'
              onClick={this.handleReLoad}
            >
              {
                !reLoad? (<RedoOutlined />) : (<SyncOutlined spin />)
              }
            </div>
            {this.state.tabActive === '1' ? (
              <div
                className='border flex items-center py-0.5 px-4 rounded cursor-pointer ml-3'
                onClick={()=>history.push({ pathname: '/goods', query: { isAdd: true } })}
              >
                新增
              </div>
            ) : (
              <div
                className='border flex items-center py-0.5 px-4 rounded cursor-pointer ml-3'
                onClick={()=>history.push({pathname: '/plays'})}
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
          onCancel={()=>this.setState({modelVisible: false})}
          onOk={this.handleOk}
        >

          <div>{ modelContent }</div>
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
