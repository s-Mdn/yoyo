import React from 'react';
import { Tabs, message } from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  RedoOutlined,
  AudioTwoTone,
  CheckCircleTwoTone,
  SyncOutlined
} from '@ant-design/icons';
import Modal from '@/components/Modal'
import Content from './component/Content';
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
    const { goodsId, playId, tabActive } = this.state
    let response = null
    try {
      if( tabActive === '1' ) {
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

    // 商品列表
    const Goods = ( g ) => {
      return(
        <>
          {
            g.image? (<img src={g.image[0]} alt=''/>):(
              <div className='w_100 h_100 rounded overflow-hidden  border box-border'>
                <video className='w-full h-full object-fit' src={g.video_url} />
              </div>
            )
          }
          <div className='absolute left-0 top-0 z-10'>
            {
              (g.status === 'f')? (
                <div className=' flex items-center ml_3 mt-1'>
                  <AudioTwoTone twoToneColor='#ff8462' />
                  <span className='font_12 color-ee6843'>语音合成中....</span>
                </div>
              ):(
                <div className=' flex items-center ml_3 mt-1'>
                  <CheckCircleTwoTone twoToneColor='#ff8462' />
                </div>
              )
            }
          </div>
        </>
      )
    }

    // 播放列表
    const Plays = ( p ) => {
      return(
        <>
          {
            isImage(p.cover_image)?(<img src={p.cover_image} alt=''/>) : (<video className='object-fit h-full' src={p.cover_image}/>)
          }
        </>
      )
    }

    return (
      <div className='box-border goodsmanage overflow-hidden'>
        <div className='pb-6 pt-4 pl-6 pr-6 bg-white rounder relative goodsmanage_h_full box-border'>
          <Tabs onChange={this.handleTabChange} defaultActiveKey='1'>
            <TabPane tab='所有商品' key='1'>
              <Content
                content={goodsList}
                childrenNode={Goods}
                handleDelete={this.handleGoodsDelete}
                handleEdit={this.handleGoodsEdit}
              />
            </TabPane>
            <TabPane tab='播放列表' key='2'>
              <Content
                content={playList}
                childrenNode={Plays}
                handleDelete={this.handlePlaysDelete}
                handleEdit={this.handlePlaysEdit}
              />
            </TabPane>
          </Tabs>

          {/* 右上角新增和刷新 */}
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
