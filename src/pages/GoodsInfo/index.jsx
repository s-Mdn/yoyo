import React from 'react';
import { Radio, Form, Input, Table, Select, message, Upload } from 'antd';
import { CloseCircleTwoTone, ArrowLeftOutlined } from '@ant-design/icons';
import API from '@/services';
import './index.less';


const $Upload = React.lazy(()=>import('@/components/Upload'))
class GoodsInfo extends React.Component {
  constructor(props) {
    super(props)
  }
  state = {
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
    dataSource: [
      // {
      //   key: 0,
      //   index: 0,
      //   introduce: '文案',
      //   action: [
      //     {value: '开场', label: '开场'},
      //     {value: '自然', label: '自然'},
      //     {value: '赞美', label: '赞美'},
      //   ],
      //   action_tag_list:['赞美'],
      //   wav_url_list: [],
      //   speed:[
      //     {value: '0.5', label: '0.5'},
      //     {value: '0.75', label: '0.75'},
      //     {value: '1.0', label: '1.0'},
      //     {value: '1.25', label: '1.25'},
      //     {value: '1.5', label: '1.5'},
      //     {value: '1.75', label: '1.75'},
      //     {value: '2.0', label: '2.0'},
      //   ],
      //   speed_list: ['1'],
      // }
    ],
    // 商品信息
    goodsInfo: {}
  }

  // 上传
  handleUpload = ({ file }) => {
    if( file.status === 'done' ) {
      if ( this.state.radValue === 1 ) {
        this.setState((state)=>{
          const imageUrlList = [...state.goodsInfo.image, file.response.data]
          state.goodsInfo.image = imageUrlList
          return {goodsInfo: state.goodsInfo }
        })
      } else {
        this.state.goodsInfo.video.url = file.response.data
        this.setState({goodsInfo: this.state.goodsInfo})
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
    this.state.goodsInfo[t] = e.target.value
    this.setState({goodsInfo: this.state.goodsInfo})
  }

  // 更新语音
  handleUpdateVoice = (i, file) => {
    if (file.status === 'done') {
      const { dataSource } = this.state;
      const data = {
        simple_id: dataSource[i].simple_sentence_id_list[0],
        file_link: file.response.data,
      }
      API.goodsManageApi.updataVoice(data)
        .then(r => {
          dataSource[i].wav_url_list[0] = file.response.data
          this.setState({ dataSource })
        }).catch(e => {
          message.error('语音更替失败！');
          return false;
        })
    }
  }

  // 复原
  handleRecovery = (r) => {
    const data = {simple_id: r.simple_sentence_id_list[0]}
    API.goodsManageApi.restoreVioce(data)
      .then(r => {
        message.success('复原成功')
      }).catch(e => {
        message.error(e || '复原失败！')
        return false
      })
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
          <Upload 
            maxCount={1}
            className='border rounded w_5rem py-1'
            data={(file)=>({suffix: file.name.slice(file.name.lastIndexOf('.'))})}
            showUploadList={false}
            accept='audio/ogg,audio/mp3,audio/wav,audio/m4a,audio/flac'
            action={`${process.env.REACT_APP_API}/api/common/upload`}
            onChange={this.handleUpdateVoice}
          >替换语音</Upload>
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
    {value: '0.5', label: '0.5'},
    {value: '0.75', label: '0.75'},
    {value: '1.0', label: '1.0'},
    {value: '1.25', label: '1.25'},
    {value: '1.5', label: '1.5'},
    {value: '1.75', label: '1.75'},
    {value: '2.0', label: '2.0'},
  ]

  componentDidMount = () => {
    if( this.props.location?.query ) {
      const query = JSON.parse(this.props.location.query)
      console.log( query )
      const { speed_list } = query
      const dataSource = []
      speed_list.forEach((e, i) => {
        dataSource.push({
          key: i,
          index: i,
          introduce: query.introduce,
          action: this.action,
          speed: this.speed,
          simple_sentence_id_list: query.simple_sentence_id_list,
          speed_list: query.speed_list,
          wav_url_list: query.wav_url_list,
          action_tag_list: query.action_tag_list
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
        dataSource,
        goodsInfo,
        radValue: query.video_url? 2 : 1
      })
    }
  }

  render() {
    const { radValue, imageAccept, videoAccept, imageUrlList, dataSource, goodsInfo } = this.state
    const { imgData, videoData, handleUpload, handleDeleteGoods, handleGoodsInfo, columns } = this
    return(
      <div className='goodsinfo h-full overflow-hidden'>
        <div className='flex-1 goods_h_full p-6 bg-white'>
          <div className='head mb-4'>
            <div className='hand_title flex items-center text-black font_20 font-semibold'>
              <div className='flex items-center cursor-pointer w_30px'>
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
                          <i className='flex items-center absolute -top_5px -right_5px'>
                            <CloseCircleTwoTone twoToneColor='#ff8462'/>
                          </i>
                        </div>
                      </>
                    )
                  }
                  <div className='w_100px h_100px border rounded'>
                    {
                      (radValue===1)? (
                        <$Upload
                          multiple={true}
                          accept={imageAccept}
                          data={imgData}
                          handleUpload={handleUpload}
                        />
                      ):(
                        <>
                          {
                            !goodsInfo.video_url && (
                              <$Upload
                                multiple={false}
                                accept={videoAccept}
                                data={videoData}
                                handleUpload={handleUpload}
                              />
                            )
                          }
                        </>
                      )
                    }
                  </div>
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
            <button className='flex items-center justify-center h_35px w_120px border rounded-full mr-10'>取消</button>
            <button className='flex items-center justify-center h_35px w_120px border rounded-full bg-ff8462 text-white'>确定</button>
          </div>
        </div>
      </div>
    )
  }
}
export default GoodsInfo;

// import React from 'react';
// import { Radio, Upload, Input, Table, Select, message } from 'antd';
// import {
//   PlusOutlined,
//   CloseCircleTwoTone,
//   ArrowLeftOutlined,
// } from '@ant-design/icons';

// import { common, validate} from '@/utils';
// import API from '@/services';
// import './index.less';


// const { downloadUrlFile } = common
// const { isImage } = validate


// class GoodsInfo extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       // 添加的商品列表图
//       goodsList: [],
//       // tabel数据头
//       columns: [
//         {
//           title: '序号',
//           dataIndex: 'order',
//         },
//         {
//           title: '介绍文案',
//           dataIndex: 'introduce',
//           render: (text) => {
//             return (
//               <div className='w-40 text-overflow-3 text-left m-auto font_12'>
//                 {text}
//               </div>
//             );
//           },
//         },
//         {
//           title: '动作标签',
//           dataIndex: 'label',
//           render: (defaultLabel, record, i) => {
//             return (
//               <div className='w-full'>
//                 <div className='font_12'>
//                   <Select
//                     bordered={false}
//                     value={defaultLabel}
//                     onChange={(e) => {
//                       this.state.dataSource[i].label = e;
//                       this.setState({
//                         dataSource: this.state.dataSource,
//                       });
//                     }}
//                     options={[
//                       { label: '开场', value: '开场' },
//                       { label: '自然', value: '自然' },
//                       { label: '赞美', value: '赞美' },
//                       { label: '欢迎', value: '欢迎' },
//                       { label: '感谢', value: '感谢' },
//                     ]}
//                   />
//                 </div>
//               </div>
//             );
//           },
//         },
//         {
//           title: '生成语音',
//           dataIndex: 'voice',
//           render: (src) => {
//             return (
//               <div className='w-full font_12'>
//                 <audio controls src={src} className='m-auto'>
//                   您的浏览器不支持 audio 标签。
//                 </audio>
//               </div>
//             );
//           },
//         },
//         {
//           title: '语音调节',
//           dataIndex: 'speed',
//           render: (defaultSpeed, record, i) => {
//             return (
//               <div className='w-full font_12'>
//                 <div>
//                   <Select
//                     bordered={false}
//                     value={defaultSpeed}
//                     onChange={(e) => {
//                       this.state.dataSource[i].speed = e;
//                       this.state.dataSource[i].speedNum = e
//                       this.setState({
//                         dataSource: this.state.dataSource,
//                       });
//                     }}
//                     options={[
//                       { label: '0.5倍数', value: '0.5' },
//                       { label: '0.75倍数', value: '0.75' },
//                       { label: '1倍数', value: '1' },
//                       { label: '1.25倍数', value: '1.25' },
//                       { label: '1.5倍数', value: '1.5' },
//                       { label: '1.75倍数', value: '1.75' },
//                       { label: '2倍数', value: '2' },
//                     ]}
//                   />
//                 </div>
//               </div>
//             );
//           },
//         },
//         {
//           title: '语音替换',
//           dataIndex: 'other',
//           render: (text, record, i) => {
//             return (
//               <div className='w-full flex items-center justify-center font_12'>
//                 <Upload
//                   beforeUpload={({ file }) => {
//                     this.handleUploadBefore(i);
//                   }}
//                   onChange={({ file }) => this.handleUpdateVioce(i, file)}
//                   showUploadList={false}
//                   maxCount={1}
//                   data={this.audioData}
//                   action={`${process.env.REACT_APP_API}/api/common/upload`}
//                   // action={`${process.env.REACT_APP_API}/api/commodity/voice_replace`}
//                   accept='audio/ogg,audio/mp3,audio/wav,audio/m4a,audio/flac'
//                 >
//                   <div className='flex items-center justify-center h-7 w-20 border rounded mr-4'>
//                     <span className='font_12'>替换语音</span>
//                   </div>
//                 </Upload>
//                 <button
//                   className='flex items-center justify-center h-7 w-20 border rounded mr-4'
//                   onClick={(e) => this.handleVioceRecover(record.sentenceId)}
//                 >
//                   <span className='font_12'>复原</span>
//                 </button>
//                 <button
//                   className='flex items-center justify-center h-7 w-20 border rounded mr-4'
//                   onClick={(e) => this.handleVioceDowload(record)}
//                 >
//                   <span className='font_12'>下载语音</span>
//                 </button>
//               </div>
//             );
//           },
//         },
//       ],
//       // tabel数据
//       dataSource: [],
//       // 商品名称
//       goodsName: '',
//       // 商品价格
//       goodsPrice: '',
//       // 商品介绍
//       introduce: '',
//       // 增加或编辑
//       isAdd: false,
//       // 选中的radio
//       selectRadio: 1,
//     };
//   }

//   // Upload回调
//   handleChange = ({ fileList, file }) => {
//     if (file.status === 'done') {
//       this.state.goodsList.push(file.response.data);
//       this.setState({ goodsList: this.state.goodsList });
//     }
//   };

//   // 删除商品
//   handleDeleteGoods = (i) => {
//     this.state.goodsList.splice(i, 1);
//     this.setState({ goodsList: this.state.goodsList });
//   };

//   // 添加商品
//   handleAddGoods = async () => {
//     const { goodsList, introduce, goodsName, goodsPrice, selectRadio } =
//       this.state;
//     if (goodsList.length === 0 || !introduce || !goodsName || !goodsPrice) {
//       message.warning('请添加完整的商品信息！');
//       return false;
//     }

//     let response = null;
//     const data = {
//       image: goodsList.map((e) => {
//         return e;
//       }),
//       introduce,
//       name: goodsName,
//       price: goodsPrice,
//     };
//     if (selectRadio == 2) {
//       delete data.image;
//       data.video_url = goodsList[0];
//     }
//     try {
//       response = await API.goodsManageApi.addGoods(data);
//     } catch (error) {
//       message.error(error || '语音生成失败！');
//       return false;
//     }
//     if (response && response.code === 200 && response.data) {
//       localStorage.setItem('tabActive', '1')
//       message.success('添加成功，退出等待语音生成！');
//       let timeOut = setTimeout(() => {
//         this.props.history.goBack();
//         clearTimeout(timeOut);
//       }, 1000);
//     }
//   };

//   // 更新商品
//   handleUpdataGoods = async () => {
//     const { goodsName, goodsPrice, introduce, goodsList, dataSource, selectRadio } =
//       this.state;

//     if (goodsList.length === 0 || !goodsName || !goodsName || !introduce) {
//       message.warning('请添加商品信息！');
//       return false;
//     }

//     const data = {
//       tag_list: [],
//       speed_list: [],
//       simple_sentence_id_list: [],
//       image: goodsList,
//       name: goodsName,
//       price: goodsPrice,
//       introduce,
//       id: this.props.location.query.goods.id,
//     };

//     if (selectRadio == 2) {
//       delete data.image;
//       data.video_url = goodsList[0];
//     }

//     dataSource.forEach((e, i) => {
//       data.tag_list.push(dataSource[i].label);
//       data.speed_list.push(dataSource[i].speedNum);
//       data.simple_sentence_id_list.push(dataSource[i].sentenceId);
//     });

//     let response = null;
//     try {
//       response = await API.goodsManageApi.updateGoods(data);
//     } catch (error) {
//       message.warning(
//         error || '语音正则合成中，请稍后在做修改！'
//       );
//       return false;
//     }
//     if (response && response.code === 200 && response.data) {
//       message.success('修改成功！');
//       localStorage.setItem('tabActive', '1')
//       let timeOut = setTimeout(() => {
//         clearTimeout(timeOut);
//         this.props.history.goBack();
//       }, 1000);
//     }
//   };

//   // 图片参数
//   data = (file) => {
//     const suffix = file.name.slice(file.name.lastIndexOf('.'));
//     return {
//       suffix: suffix,
//       preffix: 'goodsImg',
//     };
//   };

//   // 视频参数
//   videoData = (file) => {
//     const suffix = file.name.slice(file.name.lastIndexOf('.'));
//     return {
//       suffix: suffix,
//     };
//   };

//   // 语音参数
//   audioData = (file) => {
//     const suffix = file.name.slice(file.name.lastIndexOf('.'));
//     return {
//       suffix: suffix,
//     };
//   };
//   // 更新音频
//   handleUpdateVioce = async (i, file) => {
//     const { dataSource } = this.state;
//     if (file.status === 'done') {
//       let response = null;
//       try {
//         response = await API.goodsManageApi.updataVoice({
//           simple_id: dataSource[i].sentenceId,
//           file_link: file.response.data,
//         });
//       } catch (error) {
//         message.error('语音更替失败！');
//         return false;
//       }
//       dataSource[i].updateStatus = false;
//       dataSource[i].voice = file.response.data;
//       this.setState({ dataSource: this.state.dataSource });
//     }
//   };

//   // 上传前
//   handleUploadBefore = (i) => {
//     const { dataSource } = this.state;
//     dataSource[i].updateStatus = true;
//     this.setState({ dataSource: this.state.dataSource });
//   };

//   // 音频复原
//   handleVioceRecover = async (id) => {
//     const data = {
//       simple_id: id,
//     };
//     try {
//       await API.goodsManageApi.restoreVioce(data);
//     } catch (error) {
//       return false;
//     }
//   };

//   // 下载语音
//   handleVioceDowload = async (url) => {
//     downloadUrlFile(url.voice);
//   };

//   // async componentDidMount() {
//   //   if (!this.props.location?.query?.isAdd) {
//   //     const {
//   //       word_list: introduce,
//   //       action_tag_list: label,
//   //       wav_url_list: wavs,
//   //       video_url: video,
//   //       speed_list: speeds,
//   //       simple_sentence_id_list: sentenceId,
//   //       image,
//   //       name,
//   //       price,
//   //       introduce: introduceTxt,
//   //     } = this.props.location?.query?.goods;
//   //     // tabel数据源
//   //     const dataSource = [];
//   //     label.forEach((e, i) => {
//   //       dataSource.push({
//   //         key: i,
//   //         order: i,
//   //         introduce: introduce[i],
//   //         label: label[i],
//   //         voice: wavs[i],
//   //         speedNum: speeds[i],
//   //         speed: speeds[i] + '倍数',
//   //         sentenceId: sentenceId[i],
//   //         updateStatus: false,
//   //       });
//   //     });
//   //     this.setState({
//   //       dataSource,
//   //       goodsName: name,
//   //       goodsList: image || [video],
//   //       goodsPrice: price,
//   //       selectRadio: video ? 2 : 1,
//   //       introduce: introduceTxt,
//   //       isAdd: this.props.location.query.isAdd,
//   //     });
//   //   } else {
//   //     this.setState({
//   //       isAdd: this.props.location.query.isAdd,
//   //     });
//   //   }
//   // }

//   render() {
//     const {
//       columns,
//       dataSource,
//       goodsName,
//       goodsPrice,
//       introduce,
//       goodsList,
//       isAdd,
//       selectRadio,
//     } = this.state;

//     return (
//       <div className='h-full overflow-hidden goodsinfo'>
//         <div className='flex-1 bg-white goods_h-full p-6'>
//           <div className='flex head items-center mb-4'>
//             <div className='font_20 flex items-center text-black font-semibold w-auto'>
//               <div
//                 className='flex items-center cursor-pointer w_30px'
//                 onClick={this.props.history.goBack}
//               >
//                 <ArrowLeftOutlined />
//               </div>
//               <span className='ml-3'>商品管理/新增商品</span>
//             </div>
//           </div>
//           <div className='content'>
//             <div className='content_upload flex ml_30px'>
//               <span className='mr-4'>商品展示</span>
//               <div className='upload-area'>
//                 <div className='upload_type mb-2'>
//                   <Radio.Group
//                     value={selectRadio}
//                     onChange={(e) => {
//                       this.setState({
//                         selectRadio: e.target.value,
//                         goodsList: [],
//                       });
//                     }}
//                   >
//                     <Radio value={1}>上传图片</Radio>
//                     <Radio value={2}>上传视频</Radio>
//                   </Radio.Group>
//                 </div>
//                 <div className='flex'>
//                   <div className='goods_wrap flex flex-wrap'>
//                     {goodsList.map((e, i) => (
//                       <div
//                         className={[
//                           'w_100px h_100px border relative',
//                           i > 0 && 'ml_15px',
//                         ].join(' ')}
//                         key={e}
//                       >
//                         <div className='w-full h-full overflow-hidden border_radius_5px'>
//                           {isImage(e) ? (
//                             <img src={e} alt='' className='w-full h-full object-fit-cover' />
//                           ) : (
//                             <video
//                               className='w-full h-full object-fit-cover'
//                               src={e}
//                             />
//                           )}
//                         </div>
//                         <div
//                           className='absolute top-0 _right_7px _top_7px z-20 flex justify-center items-center'
//                           onClick={() => this.handleDeleteGoods(i)}
//                         >
//                           <CloseCircleTwoTone twoToneColor='#ee6843' />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   {selectRadio == 1 ? (
//                     <Upload
//                       showUploadList={false}
//                       data={this.data}
//                       action={`${process.env.REACT_APP_API}/api/common/upload`}
//                       accept='.jpg, .png, .gif, .webp, .bmp,'
//                       multiple={true}
//                       onChange={this.handleChange}
//                     >
//                       <div
//                         className={[
//                           'w_100px h_100px border_radius_5px border flex justify-center items-center flex-col',
//                           goodsList.length && 'ml_15px',
//                         ].join(' ')}
//                       >
//                         <PlusOutlined />
//                         <div style={{ marginTop: 8 }}>image</div>
//                       </div>
//                     </Upload>
//                   ) : (
//                     <>
//                       {selectRadio == 2 && (
//                         <>
//                           {!(goodsList.length >= 1) && (
//                             <Upload
//                               showUploadList={false}
//                               data={this.videoData}
//                               action={`${process.env.REACT_APP_API}/api/common/upload`}
//                               accept='.mp4, .avi .flv'
//                               multiple={true}
//                               onChange={this.handleChange}
//                             >
//                               <div
//                                 className={[
//                                   'w_100px h_100px border_radius_5px border flex justify-center items-center flex-col',
//                                   goodsList.length && 'ml_15px',
//                                 ].join(' ')}
//                               >
//                                 <PlusOutlined />
//                                 <div style={{ marginTop: 8 }}>video</div>
//                               </div>
//                             </Upload>
//                           )}
//                         </>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className='content_info mt-4 '>
//               <div className='goods_name flex items-center ml_30px'>
//                 <span className='mr-4'>商品名称</span>
//                 <Input
//                   style={{ width: '50%' }}
//                   placeholder='请输入商品名称'
//                   value={goodsName}
//                   onChange={(e) => this.setState({ goodsName: e.target.value })}
//                 />
//               </div>
//               <div className='goods_price flex mb-6 mt-6 ml_30px'>
//                 <span className='mr-4'>商品价格</span>
//                 <Input
//                   style={{ width: '50%' }}
//                   placeholder='请输入商品价格'
//                   value={goodsPrice}
//                   onChange={(e) =>
//                     this.setState({ goodsPrice: e.target.value })
//                   }
//                 />
//               </div>
//               <div className='goods_introduce flex ml_30px'>
//                 <span className='mr-4'>商品介绍</span>
//                 <div className='w-2/4 h_200 relative'>
//                   <Input.TextArea
//                     style={{ height: '100%', resize: 'none' }}
//                     placeholder='请输入商品介绍'
//                     value={introduce}
//                     onChange={(e) =>
//                       this.setState({ introduce: e.target.value })
//                     }
//                   />
//                   <div className='font_12'>介绍文案以句号为段落结束</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {dataSource.length > 0 && (
//             <div className='tabel_voice mt-12 ml-3 '>
//               {
//                 <Table
//                   pagination={false}
//                   columns={columns}
//                   dataSource={dataSource}
//                   className='text-center font_12'
//                 />
//               }
//             </div>
//           )}

//           <div className='footer flex justify-center mt-20'>
//             <button
//               className='cancal_btn foonter_btn py-1 px-8 border rounded-full mr-8'
//               onClick={() => {
//                 localStorage.setItem('tabActive', '1')
//                 this.props.history.goBack();
//               }}
//             >
//               取消
//             </button>
//             {isAdd ? (
//               <button
//                 className='save_btn foonter_btn py-1 px-8 border rounded-full bg-FF8462 border-color text-white'
//                 onClick={this.handleAddGoods}
//               >
//                 保存
//               </button>
//             ) : (
//               <button
//                 className='save_btn foonter_btn py-1 px-8 border rounded-full bg-FF8462 border-color text-white'
//                 onClick={this.handleUpdataGoods}
//               >
//                 保存
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }
// }
// export default GoodsInfo;
