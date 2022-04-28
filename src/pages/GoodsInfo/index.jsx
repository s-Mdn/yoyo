import React from 'react';
import { Radio, Form, Input, Table, Select, message, Upload } from 'antd';
import { CloseCircleTwoTone, ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import API from '@/services';
import './index.less';


const UploadGoods = React.lazy(()=>import('@/components/Upload'));

class GoodsInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // 单选框
      radValue: 1,
      // 上传的图片
      imageUrlList: [],
      // 上传的视频
      videoUrl:'',
      // 上传图片内容格式
      imageAccept:'.jpg, .png, .gif, .webp, .bmp,',
      // 上传视频内容格式
      videoAccept: '.mp4, .avi .flv',
      // 表单数据
      dataSource: [],
      // 商品信息
      goodsInfo: {},
      // 商品ID
      id: '',
      // 更新或添加
      isUpdate: false,
    }
  }

  // 上传
  handleUpload = ({ file }) => {
    if( file.status === 'done' ) {
      if ( this.state.radValue === 1 ) {
        this.setState((state)=>{
          const image = state.goodsInfo.image? [...state.goodsInfo.image] : []
          const imageUrlList = [...image, file.response.data]
          state.goodsInfo.image = imageUrlList
          return {goodsInfo: state.goodsInfo }
        })
      } else {
        const goodsInfo = this.state.goodsInfo
        goodsInfo.video.url = file.response.data
        this.setState({goodsInfo})
      }
    }
    if( file.status === 'error' ) {
      message.error('上传失败！')
      return false
    }
  }

  // 上传图片data参数
  imgData = (file) =>({
    suffix: file.name.slice(file.name.lastIndexOf('.')),
    preffix: 'goodsImg',
  })

  // 上传视频data参数
  videoData = (file) =>({
    suffix: file.name.slice(file.name.lastIndexOf('.')),
  })

  // 删除上传内容
  handleDeleteGoods = (i) => {
    const { radValue, goodsInfo } = this.state
    if( radValue === 2 ) {
      goodsInfo.video_url = ''
      this.setState({ goodsInfo })
    } else {
      this.setState(state=>{
        state.goodsInfo.image.splice(i, 1)
        return {goodsInfo: state.goodsInfo}
      })
    }
  }

  // 修改下拉框内容
  handleLabelChange = (i, t, l) => {
    this.setState(state=>{
      state.dataSource[i][t][0] = l
      return {dataSource: state.dataSource }
    })
  }

  // 修改商品名称 价格 介绍
  handleGoodsInfo = (t, e) => {
    const goodsInfo = this.state.goodsInfo
    goodsInfo[t] = e.target.value
    this.setState({goodsInfo})
  }

  // 更新语音
  handleUpdateVoice = (i, { file }) => {
    if( file.status !== 'done' || file.status !== 'error' ) {
      this.setState((state)=>{
        state.dataSource[i].updateVoiceState = true
        return { dataSource: state.dataSource }
      })
    }

    if (file.status === 'done') {
      const data = {
        simple_id: this.state.dataSource[i].simple_sentence_id_list[0],
        file_link: file.response.data,
      }
      this.updataVoice(data, i)
    }

    if( file.status === 'error' ) {
      message.error('语音上传失败！')
    }
  }

  // 更替语音请求
  updataVoice = (data, i) => {
    API.goodsManageApi.updataVoice(data)
      .then(r => {
        console.log( r )
        this.setState((state)=>{
          const dataSource = state.dataSource
          dataSource[i].wav_url_list[0] = data.file_link
          dataSource[i].isReplaced = true
          dataSource[i].updateVoiceState = false
          return { dataSource }
        })
      }).catch(e => {
        this.setState((state)=>{
          state.dataSource[i].updateVoiceState = false
          return { dataSource: state.dataSource }
        })
        message.error('语音更替失败！');
        return false;
      })
  }

  // 语音复原
  handleRecovery = (r) => {
    // 没有更新过语音的不会有复原语音
    if( !r.isReplaced ) { return false }

    const data = {simple_id: r.simple_sentence_id_list[0]}
    API.goodsManageApi.restoreVioce(data)
      .then(r => {
        message.success('复原成功')
      }).catch(e => {
        message.error(e || '复原失败！')
        return false
      })
  }

  // 保存
  handleSubmit = () => {
    const { goodsInfo, dataSource, isUpdate, id, radValue } = this.state;
    const data = {...goodsInfo, id}
    
    // 处理上传图片或视频
    data.image = (radValue===1)? data.image : null
    data.video_ur = (radValue===2)? data.video_ur : null
   
    if( !isUpdate ) {
      this.addGoods(data)
    } else {
      data.tag_list = []
      data.speed_list = []
      data.simple_sentence_id_list = []

      dataSource.forEach(e => {
        data.tag_list.push(...e.action_tag_list)
        data.speed_list.push(...e.speed_list)
        data.simple_sentence_id_list.push(...e.simple_sentence_id_list)
      })

      console.log( data )
      this.updateGoods(data)
    }
  }

  // 添加商品
  addGoods = (data) => {
    API.goodsManageApi.addGoods(data)
      .then(r => {
        message.success('添加成功，退出等待语音生成！');
        this.goBack()
      }).catch(e => {
        message.error(e || '添加失败！');
        return false;
      })
  }

  // 更新商品
  updateGoods = (data) => {
    API.goodsManageApi.updateGoods(data)
      .then(r => {
        message.success('修改成功，退出等待语音生成！');
        this.goBack()
      }).catch(e => {
        message.error(e || '更新失败！');
        return false;
      })
  }

  // 退回上一页
  goBack = () => {
    const timer = setTimeout(()=>{
      this.props.history.goBack();
      clearTimeout(timer);
    }, 1000)
  }

  // 表单
  columns = [
    {
      align: 'center',
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      className: 'font_12 p_8px',
      width: '60px'
    },
    {
      align: 'center',
      title: '文案',
      dataIndex: 'introduce',
      key: 'introduce',
      className: 'font_12 w_10rem p_8px text-overflow',
    },
    {
      align: 'center',
      title: '标签',
      dataIndex: 'action',
      key: 'action',
      className: 'font_12 w_10rem p_8px',
      render: (text, record, index)=>(
        <>
          <Select
            bordered={false}
            value={record.action_tag_list[0]}
            options={record.action}
            onChange={this.handleLabelChange.bind(this, index, 'action_tag_list')}
          />
        </>
      )
    },
    {
      align: 'center',
      title: '语音',
      dataIndex: 'wav_url_list',
      key: 'wav_url_list',
      className: 'font_12 p_8px',
      render:(text, record, index)=>(
        <>
          <audio controls src={record.wav_url_list[0]} className='w-64'>您的浏览器不支持 audio 标签。</audio>
        </>
      )
    },
    {
      align: 'center',
      title: '速度',
      dataIndex: 'speed',
      key: 'speed',
      className: 'font_12 p_8px',
      render:(text, record, index)=>(
        <>
          <Select
            bordered={false}
            value={record.speed_list[0]}
            options={record.speed}
            onChange={this.handleLabelChange.bind(this, index, 'speed_list')}
          />
        </>
      )
    },
    {
      align: 'center',
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      className: 'font_12 p_8px',
      render: (text, record, index)=>(
        <div className='flex'>
          {
            record.updateVoiceState?(
              <span className='border rounded w_5rem py-1'>
                <LoadingOutlined/>
              </span>
            ):(
              <Upload 
                maxCount={1}
                className='border rounded w_5rem py-1'
                data={(file)=>({suffix: file.name.slice(file.name.lastIndexOf('.'))})}
                showUploadList={false}
                accept='audio/ogg,audio/mp3,audio/wav,audio/m4a,audio/flac'
                action={`${process.env.REACT_APP_API}/api/common/upload`}
                onChange={this.handleUpdateVoice.bind(this, index)}
              >替换语音</Upload>
            )
          }
          <button className='border rounded w_5rem py-1 mx-3' onClick={this.handleRecovery.bind(this, record)}>复原</button>
          <button className='border rounded w_5rem py-1'>下载语音</button>
        </div>
      )
    },
  ]

  // 标签
  action = [
    {value: '开场', label: '开场'},
    {value: '自然', label: '自然'},
    {value: '赞美', label: '赞美'},
  ]

  // 速度
  speed = [
    {value: 0.5, label: 0.5},
    {value: 0.75, label: 0.75},
    {value: 1.0, label: 1.0},
    {value: 1.25, label: 1.25},
    {value: 1.5, label: 1.5},
    {value: 1.75, label: 1.75},
    {value: 2.0, label: 2.0},
  ]

  componentDidMount = () => {
    if( this.props.location?.query ) {
      const query = JSON.parse(this.props.location.query)
      const { word_list, speed_list, wav_url_list, action_tag_list, simple_sentence_id_list } = query

      const dataSource = []
      word_list.forEach((e, i)=>{
        dataSource.push({
          key: i,
          index: i,
          updateVoiceState: false,
          isReplaced: false,
          introduce: e,
          action: this.action,
          speed: this.speed,
          simple_sentence_id_list: [simple_sentence_id_list[i]],
          speed_list: [speed_list[i]],
          wav_url_list: [wav_url_list[i]],
          action_tag_list: [action_tag_list[i]]
        })
      })
      const goodsInfo = {
        name: query.name,
        introduce: query.introduce,
        price: query.price,
        image: query.image,
        video_url: query.video_url
      }

      this.setState({
        id: query.id,
        isUpdate: true,
        dataSource,
        goodsInfo,
        radValue: query.video_url? 2 : 1
      })
    }
  }

  render() {
    const { radValue, imageAccept, videoAccept, imageUrlList, dataSource, goodsInfo } = this.state
    const { imgData, videoData, handleUpload, handleDeleteGoods, handleGoodsInfo, handleSubmit,  columns } = this
    const Button = ()=>(
      <>
        {
          (goodsInfo.name && goodsInfo.price && goodsInfo.introduce && ((radValue===1 && goodsInfo.image?.length) && true || (radValue === 2 && goodsInfo.video_url) && true))?
            (
              <button className='flex items-center justify-center h_35px w_120px border rounded-full bg-ff8462 text-white' onClick={handleSubmit}>保存</button>
            ):(
              <button className='flex items-center justify-center h_35px w_120px border rounded-full text-white bg_ccc'>保存</button>
            )
        }
      </>
    )

    return(
      <div className='goodsinfo h-full overflow-hidden'>
        <div className='flex-1 goods_h_full p-6 bg-white'>
          <div className='head mb-4'>
            <div className='hand_title flex items-center text-black font_20 font-semibold'>
              <div className='flex items-center cursor-pointer w_30px' onClick={this.props.history.goBack}>
                <ArrowLeftOutlined />
              </div>
              <span className='ml-3' onClick={()=>console.log( imageUrlList )}>商品管理/新增商品</span>
            </div>
          </div>
          <div className='body m_l_30px font_12 text-black'>
            <div className='upload_image flex items-start mb-6'>
              <span className='w_60px flex-none'>商品展示：</span>
              <div className='w-full'>
                <Radio.Group value={radValue} onChange={e=>this.setState({radValue: e.target.value})}>
                  <Radio value={1}>上传图片</Radio>
                  <Radio value={2}>上传视频</Radio>
                </Radio.Group>
                <div className='flex flex-wrap mt-3'>
                  {
                    (radValue===1) && (
                      <>
                        {
                          goodsInfo?.image?.map((e, i)=>(
                            <div className='relative w_100px h_100px border rounded m_r_20px' key={e}>
                              <img src={e} className='w-full h-full object-fit-cover' alt=''/>
                              <i className='flex items-center absolute -top_5px -right_5px' onClick={handleDeleteGoods.bind(this, i)}>
                                <CloseCircleTwoTone twoToneColor='#ff8462'/>
                              </i>
                            </div>
                          ))
                        }
                      </>
                    )
                  }
                  {
                    (radValue===2 && goodsInfo?.video_url) && (
                      <>
                        <div className='relative w_100px h_100px border rounded m_r_20px'>
                          <video src={goodsInfo.video_url} className='w-full h-full object-fit-cover' alt=''/>
                          <i className='flex items-center absolute -top_5px -right_5px' onClick={handleDeleteGoods.bind(this)}>
                            <CloseCircleTwoTone twoToneColor='#ff8462'/>
                          </i>
                        </div>
                      </>
                    )
                  }
                  {
                    (radValue===1)? (
                      <div className='w_100px h_100px border rounded'>
                        <UploadGoods
                          multiple={true}
                          accept={imageAccept}
                          data={imgData}
                          handleUpload={handleUpload}
                        />
                      </div>
                    ):(
                      <>
                        {
                          ( !goodsInfo?.video_url) && (
                            <div className='w_100px h_100px border rounded'>
                              <UploadGoods
                                multiple={false}
                                accept={videoAccept}
                                data={videoData}
                                handleUpload={handleUpload}
                              />
                            </div>
                          )
                        }
                      </>
                    )
                  }

                </div>
              </div>
            </div>
            <div className='goods_info '>
              <Form autoComplete='off'>
                <Form.Item className='flex'>
                  <div className='flex items-center'>
                    <span className='w_60px flex-none font_12'>商品名称：</span>
                    <p className='border rounded w-3/4'>
                      <Input
                        bordered={false}
                        value={goodsInfo.name}
                        placeholder='请输入商品名称'
                        onChange={handleGoodsInfo.bind(this, 'name')}
                      />
                    </p>
                  </div>
                </Form.Item>
                <Form.Item>
                  <div className='flex items-center'>
                    <span className='w_60px flex-none font_12'>商品价格：</span>
                    <p className='border rounded w-3/4'>
                      <Input
                        bordered={false}
                        value={goodsInfo.price}
                        placeholder='请输入商品价格'
                        onChange={handleGoodsInfo.bind(this, 'price')}
                      />
                    </p>
                  </div>
                </Form.Item>
                <Form.Item>
                  <div className='flex items-start'>
                    <span className='w_60px flex-none font_12'>商品介绍：</span>
                    <div className='border rounded w-3/4'>
                      <Input.TextArea
                        value={goodsInfo.introduce}
                        style={{ height: '10rem', resize: 'none' }}
                        bordered={false}
                        autoSize={false}
                        placeholder='请输入商品介绍'
                        onChange={handleGoodsInfo.bind(this, 'introduce')}
                      />
                    </div>
                  </div>
                  <span className='font_12 m_l_60px'>介绍文件以句号为段落结束</span>
                </Form.Item>
              </Form>
            </div>
            {
              (dataSource.length)? (
                <div className='goods_tabe font_12'>
                  <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                  />
                </div>
              ):(null)
            }
          </div>
          <div className='footer flex justify-center w-full mt-10'>
            <button className='flex items-center justify-center h_35px w_120px border rounded-full mr-10' onClick={this.props.history.goBack}>取消</button>
            {
              Button()
            }
          </div>
        </div>
      </div>
    )
  }
}
export default GoodsInfo;