import React, { useEffect, useState } from 'react';
import { Tabs, message } from 'antd';
import { withRouter, Link } from 'react-router-dom';
import { RedoOutlined, AudioTwoTone, CheckCircleTwoTone, LoadingOutlined } from '@ant-design/icons';
import { validate } from '@/utils';
import API from '@/services';
import './index.less';

const { isImage } = validate;
const Content = React.lazy(()=>import('./component/Content'));
const Modal = React.lazy(()=>import('@/components/Modal'));
const GoodsManage = ( props )=> {
  const { history } = props;
  const [goodsList, setGoodsList] = useState([]);
  const [playList, setPlayList] = useState([]);
  const [tabsKey, setTabsKey] = useState('1');
  const [reload, setReload] = useState(false);
  const [modalVis, setModalVis] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [itemNews, setItemNews] = useState({});

  // 获取列表
  const getGoodsAndPlaylist = () => {
    Promise.all([API.goodsManageApi.getGoodsList(), API.goodsManageApi.getPlaylist()]).then(r => {
      console.log( r )
      r[0].data.content.forEach(e => {
        e.url = e.video_url || e.image[0]
      })
      r[1].data.content.forEach(e => {
        e.url = e.cover_image
      })
      console.log(r[0].data.content)
      setGoodsList([...r[0].data.content])
      setPlayList([...r[1].data.content])
      setReload(false)
    }).catch(e=>{
      console.log( e )
      return false
    })
  }

  // 列表个体
  const itemVNdom = (e, bol) => (
    <>
      <div className='relative b w_100px h_100px overflow-hidden border box-border rounded'>
        {
          isImage(e.url)?(
            <img src={e.url} className='w-full h-full object-fit-cover' alt='' />
          ):(
            <video src={e.url} className='w-full h-full object-fit-cover' />
          )
        }
      </div>
      <div className='font_12 px-1 text-center text-overflow'>{e.name}</div>
      <div className='justify-between absolute bottom-20px w-full bg-ff8462 opacity_75 font_12 text-white hidden hover'>
        <span className='flex-1 text-center overflow-hidden' onClick={handleItemEdit.bind(this, e)}>编辑</span>
        <span className='flex-1 text-center overflow-hidden' onClick={handleItemDelete.bind(this, e)}>删除</span>
      </div>
      {
        bol && (
          <>
            {
              (e.status==='f')? (
                <div className='flex items-center absolute top-0 left-0 color-ee6843 ml-1'><AudioTwoTone twoToneColor='#ff8462'/>...</div>
              ):(
                <div className='flex items-center absolute -top_7px -right_7px color-ee6843 ml-1'><CheckCircleTwoTone twoToneColor='#ff8462'/></div>
              )
            }
          </>
        )
      }
    </>
  )

  // 删除商品VNdom
  const deleteGoodsVNdom = (e) => (
    <>
      <div>商品名称：{e.name}</div>
      <div className='flex mt-2'>
        <span className='flex-none'>商品图片：</span>
        <div className='flex flex-wrap' style={{marginLeft:'-10px'}}>
          {
            (e?.video_url)?(
              <video src={e.url} className='w_100px h_100px object-fit-cover' style={{margin:'0 0 10px 10px'}} />
            ):(
              <>
                {
                  e?.image?.map((r, i)=>(
                    <img src={r} className='w_100px h_100px object-fit-cover' style={{margin:'0 0 10px 10px'}} key={i} alt=''/>
                  ))
                }
              </>
            )
          }
        </div>
      </div>
    </>
  )

  // 删除播放VNdom
  const deletePlaysVNdom = (e) => (
    <>
      <div>播放名称：{e.name}</div>
      <div className='flex mt-2'>
        <span className='flex-none'>播放内容：</span>
        {
          isImage(e.url)?(
            <img src={e.url} className='w_100px h_100px object-fit-cover'  alt=''/>
          ):(
            <video src={e.url} className='w_100px h_100px object-fit-cover' />
          )
        }
      </div>
    </>
  )

  // 刷新
  const handleReload = () => {
    setReload(true)
    getGoodsAndPlaylist()
  }

  // 删除Item
  const handleItemDelete = (e) => {
    if( tabsKey === '1' ) {
      if( e.status === 'f') {
        message.warning('语音合成中，无法删除！')
        return false
      }
      setModalTitle('删除商品')
    } else {
      setModalTitle('删除播放')
    }
    setModalVis(true)
    setItemNews(e)
  }

  // 编辑跳转
  const handleItemEdit = (e) => {
    switch( tabsKey ) {
      case '1':
        history.push({pathname: '/goods', query: JSON.stringify(e)})
        break
      case '2':
        history.push({pathname: '/plays', query: JSON.stringify(e)})
        break
      default:
        break
    }
  }

  // 弹窗取消
  const handleCancel = () => {
    setModalVis(false)
  }

  // 弹窗确定
  const handleOk = () => {
    switch(tabsKey) {
      case '1':
        deleteGoodsItem(itemNews)
        break
      case '2':
        deletePlaysItem(itemNews)
        break
      default:
        break
    }
  }

  // 删除商品
  const deleteGoodsItem = (e) =>{
    API.goodsManageApi.deleteGoods(e.id)
      .then(r =>{
        message.success('删除成功')
        getGoodsAndPlaylist()
        setModalVis(false)
      }).catch(e => {
        message.error(e || '删除失败！')
        return false
      })
  }

  // 商品播放列表
  const deletePlaysItem = (e) => {
    API.goodsManageApi.deletePlay(e.id)
      .then(r => {
        message.success('删除成功')
        getGoodsAndPlaylist()
        setModalVis(false)
      }).catch(e => {
        message.error(e || '删除失败！')
        return false
      })
  }

  useEffect(()=>{
    if( !modalVis ) {
      setModalTitle('')
      setItemNews({})
    }
  },[modalVis])


  useEffect(()=>{
    getGoodsAndPlaylist()
  }, [])

  return(
    <div className='box-border goodsmanage overflow-hidden'>
      <div className='pb-6 pt-4 pl-6 pr-6 bg-white rounder relative goodsmanage_h_full box-border'>
        <Tabs tabBarStyle={{margin: '0'}} value={tabsKey} onChange={e=>setTabsKey(e)}>
          <Tabs.TabPane tab='所有商品' key='1'>
            <Content
              bol={true}
              childVNdom={itemVNdom}
              content={goodsList}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab='播放列表' key='2'>
            <Content
              bol={false}
              childVNdom={itemVNdom}
              content={playList}
            />
          </Tabs.TabPane>
        </Tabs>
        <div className='flex absolute top-6 right-6 font_12'>
          <button className='flex items-center justify-center border rounded h_24px w_45px' onClick={handleReload}>
            {
              reload?(<LoadingOutlined/>):(<RedoOutlined />)
            }
          </button>
          <button className='flex items-center justify-center border rounded h_24px w_45px ml-3 text-black'>
            {
              (tabsKey === '1')?(<Link to='/goods'>新增</Link>):(<Link to='/plays'>新增</Link>)
            }
          </button>
        </div>
      </div>
      <Modal
        visible={modalVis}
        title={modalTitle}
        bodyStyle={{height:'auto'}}
        onCancel={handleCancel}
        onOk={handleOk}
      >
        {
          tabsKey === '1' && deleteGoodsVNdom(itemNews)
        }
        {
          tabsKey === '2' && deletePlaysVNdom(itemNews)
        }
        {
          tabsKey === 0 && null
        }
      </Modal>
    </div>
  )
}

export default withRouter(GoodsManage);