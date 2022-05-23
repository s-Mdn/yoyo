import React from 'react';
import { Radio, Upload, Input, Table, Select, message } from 'antd';
import {
  PlusOutlined,
  CloseCircleTwoTone,
  ArrowLeftOutlined,
} from '@ant-design/icons';

import { common, validate} from '@/utils';
import API from '@/services';
import './index.less';


const { downloadUrlFile } = common
const { isImage } = validate
let timeOut

class GoodsInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // tabel数据头
      columns: [
        {
          title: '序号',
          dataIndex: 'order',
        },
        {
          title: '介绍文案',
          dataIndex: 'introduce',
          render: (text) => {
            return (
              <div className='w-40 text-overflow-3 text-left m-auto font_12'>
                {text}
              </div>
            );
          },
        },
        {
          title: '动作标签',
          dataIndex: 'label',
          render: (defaultLabel, record, i) => {
            return (
              <div className='w-full'>
                <div className='font_12'>
                  <Select
                    bordered={false}
                    value={defaultLabel}
                    onChange={(e) => {
                      this.state.dataSource[i].label = e;
                      this.setState({
                        dataSource: this.state.dataSource,
                      });
                    }}
                    options={[
                      { label: '开场', value: '开场' },
                      { label: '自然', value: '自然' },
                      { label: '赞美', value: '赞美' },
                      { label: '欢迎', value: '欢迎' },
                      { label: '感谢', value: '感谢' },
                    ]}
                  />
                </div>
              </div>
            );
          },
        },
        {
          title: '生成语音',
          dataIndex: 'voice',
          render: (src) => {
            return (
              <div className='w-full font_12'>
                <audio controls src={src} className='m-auto'>
                  您的浏览器不支持 audio 标签。
                </audio>
              </div>
            );
          },
        },
        {
          title: '语音调节',
          dataIndex: 'speed',
          render: (defaultSpeed, record, i) => {
            return (
              <div className='w-full font_12'>
                <div>
                  <Select
                    bordered={false}
                    value={defaultSpeed}
                    onChange={(e) => {
                      this.state.dataSource[i].speed = e;
                      this.state.dataSource[i].speedNum = e
                      this.setState({
                        dataSource: this.state.dataSource,
                      });
                    }}
                    options={[
                      { label: '0.5倍数', value: '0.5' },
                      { label: '0.75倍数', value: '0.75' },
                      { label: '1倍数', value: '1' },
                      { label: '1.25倍数', value: '1.25' },
                      { label: '1.5倍数', value: '1.5' },
                      { label: '1.75倍数', value: '1.75' },
                      { label: '2倍数', value: '2' },
                    ]}
                  />
                </div>
              </div>
            );
          },
        },
        {
          title: '语音替换',
          dataIndex: 'other',
          render: (text, record, i) => {
            return (
              <div className='w-full flex items-center justify-center font_12'>
                <Upload
                  beforeUpload={({ file }) => {
                    this.handleAudioUploadBefore(i);
                  }}
                  onChange={({ file }) => this.handleUpdateVioce(i, file)}
                  showUploadList={false}
                  maxCount={1}
                  data={this.audioData}
                  action={`${process.env.REACT_APP_API}/api/common/upload`}
                  accept='audio/ogg,audio/mp3,audio/wav,audio/m4a,audio/flac'
                >
                  <div className='flex items-center justify-center h-7 w-20 border rounded mr-4'>
                    <span className='font_12'>替换语音</span>
                  </div>
                </Upload>
                <button
                  className='flex items-center justify-center h-7 w-20 border rounded mr-4'
                  onClick={(e) => this.handleVioceRecover(record.sentenceId)}
                >
                  <span className='font_12'>复原</span>
                </button>
                <button
                  className='flex items-center justify-center h-7 w-20 border rounded mr-4'
                  onClick={(e) => this.handleVioceDowload(record)}
                >
                  <span className='font_12'>下载语音</span>
                </button>
              </div>
            );
          },
        },
      ],
      // tabel数据
      dataSource: [],
      // 商品名称
      goodsName: '',
      // 商品价格
      goodsPrice: '',
      // 商品介绍
      introduce: '',
      // 增加或编辑
      isAdd: false,
      // 选中的radio
      selectRadio: 1,
      // 图片
      fileListImg: [],
      // 视频
      fileListVedio: [],
      // 是否可以提交
      isSubmit: false
    };
  }

  handleChange = ({ fileList }) => {
    if(this.state.selectRadio === 1) {
      this.setState({fileListImg: fileList})
    } else {
      this.setState({fileListVedio: fileList})
    }
    this.isSubmit()
  };

  handleRemove = (file) => {
    if(file.response.status === 'success') {
      this.isSubmit()
    }
  }

  // 更新商品
  handleUpdataGoods = async () => {
    const { 
      goodsName, 
      goodsPrice, 
      introduce, 
      dataSource, 
      selectRadio,
      fileListImg,
      fileListVedio
    } = this.state;

    const data = {
      tag_list: [],
      speed_list: [],
      simple_sentence_id_list: [],
      name: goodsName,
      price: goodsPrice,
      introduce,
      id: this.props?.location?.query?.goods?.id,
    };

    if (selectRadio === 1) {
      const image = []
      fileListImg.forEach(e =>{
        if(e.url) {
          image.push(e.url)
        } else {
          image.push(e.response.data)
        }
      })
      data.image = image
    } else {
      fileListVedio.forEach(e=>{
        data.video_url = e.response.data
      })
    }

    dataSource.forEach((e, i) => {
      data.tag_list.push(dataSource[i].label);
      data.speed_list.push(dataSource[i].speedNum);
      data.simple_sentence_id_list.push(dataSource[i].sentenceId);
    });
    

    if(!data.id) {
      delete data.simple_sentence_id_list
      delete data.speed_list
      delete data.tag_list
      delete data.id
    }
    API.goodsManageApi.updateGoods(data)
      .then(r => {
        if(r && r.code === 200 && r.data) {
          message.success('修改成功！', 0.5)

          const timeOut = setTimeout(()=>{
            clearTimeout(timeOut)
            this.props.history.goBack()
          }, 1000)
        }
      }).catch(e => {
        message.warning(e || '语音合成中，请稍后在做修改！', 0.5)
        return false;
      })
  };

  isSubmit = () => {
    const { 
      goodsName, 
      goodsPrice, 
      introduce, 
      selectRadio,
      fileListImg,
      fileListVedio,
    } = this.state;

    let fileList = selectRadio === 1? fileListImg : fileListVedio
    this.setState({isSubmit: false})

    if(goodsName && goodsPrice && introduce && fileList.length > 0) {
      this.setState({isSubmit: true})
    }
  }

  // 图片参数
  data = (file) => {
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    return {
      suffix: suffix,
      preffix: 'goodsImg',
    };
  };

  // 视频参数
  videoData = (file) => {
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    return {
      suffix: suffix,
    };
  };

  // 语音参数
  audioData = (file) => {
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    return {
      suffix: suffix,
    };
  };

  // 更新音频
  handleUpdateVioce = async (i, file) => {
    const { dataSource } = this.state;
    if (file.status === 'done') {
      let response = null;
      try {
        response = await API.goodsManageApi.updataVoice({
          simple_id: dataSource[i].sentenceId,
          file_link: file.response.data,
        });
      } catch (error) {
        message.error('语音更替失败！');
        return false;
      }
      dataSource[i].updateStatus = false;
      dataSource[i].voice = file.response.data;
      this.setState({ dataSource: this.state.dataSource });
    }
  };

  // 上传前
  handleAudioUploadBefore = (i) => {
    const { dataSource } = this.state;
    dataSource[i].updateStatus = true;
    this.setState({ dataSource: this.state.dataSource });
  };

  // 音频复原
  handleVioceRecover = async (id) => {
    const data = {
      simple_id: id,
    };
    try {
      await API.goodsManageApi.restoreVioce(data);
    } catch (error) {
      return false;
    }
  };

  // 下载语音
  handleVioceDowload = async (url) => {
    downloadUrlFile(url.voice);
  };

  componentDidMount() {
    if (this.props.location?.query?.goods) {
      const {
        word_list: introduce,
        action_tag_list: label,
        wav_url_list: wavs,
        video_url: video,
        speed_list: speeds,
        simple_sentence_id_list: sentenceId,
        image,
        name,
        price,
        introduce: introduceTxt,
      } = this.props.location?.query?.goods;

      // tabel数据源
      const dataSource = [];
      label.forEach((e, i) => {
        dataSource.push({
          key: i,
          order: i,
          introduce: introduce[i],
          label: label[i],
          voice: wavs[i],
          speedNum: speeds[i],
          speed: speeds[i] + '倍数',
          sentenceId: sentenceId[i],
          updateStatus: false,
        });
      });


      const fileListImg = []
      const fileListVedio = []

      if(image) {
        image.forEach(e => {
          fileListImg.push({
            status: 'done',
            url: e
          })
        })
      } else {
        fileListVedio.push({
          status: 'done',
          url: video
        })
      }
      
      this.setState({
        dataSource,
        goodsName: name,
        fileListImg,
        fileListVedio,
        goodsPrice: price,
        selectRadio: video ? 2 : 1,
        introduce: introduceTxt,
      }, this.isSubmit);
    }
  }

  componentWillUnmount() {
    clearTimeout(timeOut)
  }
  render() {
    const {
      columns,
      dataSource,
      goodsName,
      goodsPrice,
      introduce,
      selectRadio,
      isSubmit
    } = this.state;

    return (
      <div className='h-full overflow-hidden goodsinfo'>
        <div className='flex-1 bg-white goods_h-full p-6'>
          <div className='flex head items-center mb-4'>
            <div className='font_20 flex items-center text-black font-semibold w-auto'>
              <div
                className='flex items-center cursor-pointer w_30px'
                onClick={this.props.history.goBack}
              >
                <ArrowLeftOutlined />
              </div>
              <span className='ml-3'>商品管理/新增商品</span>
            </div>
          </div>
          <div className='content'>
            <div className='content_upload flex ml_30px'>
              <span className='mr-4'>商品展示</span>
              <div className='upload-area'>
                <div className='upload_type mb-2'>
                  <Radio.Group
                    value={selectRadio}
                    onChange={(e) => {
                      this.setState({
                        selectRadio: e.target.value,
                      }, this.isSubmit);
                    }}
                  >
                    <Radio value={1}>上传图片</Radio>
                    <Radio value={2}>上传视频</Radio>
                  </Radio.Group>
                </div>
                <div className='flex upload'>
                  {selectRadio === 1 ? (
                    <Upload
                      listType="picture-card"
                      data={this.data}
                      action={`${process.env.REACT_APP_API}/api/common/upload`}
                      accept='.jpg, .png, .gif, .webp, .bmp,'
                      multiple={true}
                      fileList={this.state.fileListImg}
                      onChange={this.handleChange}
                      onRemove={this.handleRemove}
                    >
                      <div
                        className={[
                          'w-full h-full border_radius_5px border flex justify-center items-center flex-col',
                        ].join(' ')}
                      >
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>image</div>
                      </div>
                    </Upload>
                  ) : (
                    <Upload
                      listType="picture-card"
                      data={this.videoData}
                      fileList={this.state.fileListVedio}
                      action={`${process.env.REACT_APP_API}/api/common/upload`}
                      accept='.mp4, .avi .flv'
                      onChange={this.handleChange}
                    >
                      {
                        !this.state.fileListVedio.length && (
                          <div
                            className={[
                              'w-full h-full border_radius_5px border flex justify-center items-center flex-col',
                            ].join(' ')}
                          >
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>video</div>
                          </div>
                        )
                      }
                    </Upload>
                  )}
                </div>
              </div>
            </div>
            <div className='content_info mt-4 '>
              <div className='goods_name flex items-center ml_30px'>
                <span className='mr-4'>商品名称</span>
                <Input
                  style={{ width: '50%' }}
                  placeholder='请输入商品名称'
                  value={goodsName}
                  onChange={(e) => {
                    this.setState({ goodsName: e.target.value }, this.isSubmit)
                  }}
                />
              </div>
              <div className='goods_price flex mb-6 mt-6 ml_30px'>
                <span className='mr-4'>商品价格</span>
                <Input
                  style={{ width: '50%' }}
                  placeholder='请输入商品价格'
                  value={goodsPrice}
                  onChange={(e) =>{
                    this.setState({ goodsPrice: e.target.value }, this.isSubmit)
                  }}
                />
              </div>
              <div className='goods_introduce flex ml_30px'>
                <span className='mr-4'>商品介绍</span>
                <div className='w-2/4 h_200 relative'>
                  <Input.TextArea
                    style={{ height: '100%', resize: 'none' }}
                    placeholder='请输入商品介绍'
                    value={introduce}
                    onChange={(e) =>{
                      this.setState({ introduce: e.target.value }, this.isSubmit)
                    }}
                  />
                  <div className='font_12'>介绍文案以句号为段落结束</div>
                </div>
              </div>
            </div>
          </div>
          {dataSource.length > 0 && (
            <div className='tabel_voice mt-12 ml-3 '>
              {
                <Table
                  pagination={false}
                  columns={columns}
                  dataSource={dataSource}
                  className='text-center font_12'
                />
              }
            </div>
          )}

          <div className='footer flex justify-center mt-20'>
            <button
              className='cancal_btn foonter_btn py-1 px-8 border rounded-full mr-8'
              onClick={() => {
                this.props.history.goBack();
              }}
            >
              取消
            </button>
            {
              isSubmit?(
                <button
                  className='save_btn foonter_btn py-1 px-8 border rounded-full bg-FF8462 border-color text-white'
                  onClick={this.handleUpdataGoods}
                >
                保存
                </button>
              ):(
                <button
                  className='save_btn foonter_btn py-1 px-8 border rounded-full text-white bg_ccc'
                  onClick={this.handleUpdataGoods}
                >
                保存
                </button>
              )
            }
          </div>
        </div>
      </div>
    );
  }
}
export default GoodsInfo;
