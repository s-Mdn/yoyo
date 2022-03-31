import React from 'react';
import { Radio, Upload, Input, Table, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import utils from '@/utils';
import API from '@/services';
import './index.less';

const {common: { downloadUrlFile }} = utils
class GoodsInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      // 图片
      images: [],
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
                  beforeUpload={({ file }) => { this.handleUploadBefore(i) }}
                  onChange={({ file }) => this.handleUpdateVioce(i, file)}
                  showUploadList={false}
                  maxCount={1}
                  data={{ preffix: 1 }}
                  action={`${process.env.REACT_APP_API}/api/commodity/voice_replace`}
                  accept='audio/ogg,audio/mp3,audio/wav,audio/m4a,audio/flac'>
                  <div className='flex items-center justify-center h-7 w-20 border rounded mr-4'
                  >
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
      isAdd: false
    };
  }

  // Upload回调
  handleChange = async ({ fileList, file }) => {
    await this.setState({ images: fileList })
  };

  // 添加商品
  handleAddGoods = async () => {
    const { images, introduce, goodsName, goodsPrice } = this.state;
    if ((images.length === 0) || (!introduce || !goodsName || !goodsPrice)) {
      message.warning('请添加完整的商品信息！');
      return false;
    }

    let response = null;
    const data = {
      image: images.map(e => { return e.response.data }),
      introduce,
      name: goodsName,
      price: goodsPrice,
    };
    try {
      response = await API.goodsManageApi.addGoods(data);
    } catch (error) {
      message.error('语音生成失败！');
      return false;
    }
    if (response && response.code === 200 && response.data) {
      message.success('添加成功，退出等待语音生成！');
      let timeOut = setTimeout(() => {
        this.props.history.goBack();
        clearTimeout(timeOut);
      }, 2000);
    }
  };

  // 更新商品
  handleUpdataGoods = async () => {
    const { goodsName, goodsPrice, introduce, images, dataSource } = this.state

    if ((images.length === 0) || (!goodsName || !goodsName || !introduce)) {
      message.warning('请添加商品信息！')
      return false
    }

    const data = {
      tag_list: [],
      speed_list: [],
      simple_sentence_id_list: [],
      image: [],
      name: goodsName,
      price: goodsPrice,
      introduce,
      id: this.props.location.query.goods.id
    }

    dataSource.forEach((e, i) => {
      data.tag_list.push(dataSource[i].label)
      data.speed_list.push(dataSource[i].speedNum)
      data.simple_sentence_id_list.push(dataSource[i].sentenceId)
    })

    images.forEach(e => {
      if (e.url && e.status === 'done') {
        data.image.push(e.url)
      } else {
        data.image.push(e.response.data)
      }
    })

    let response = null
    try {
      response = await API.goodsManageApi.updateGoods(data)
    } catch (error) {
      message.warning((error && error.message) || '语音正则合成中，请稍后在做修改！')
      return false
    }
    if(response && response.code===200 && response.data) {
      message.success('修改成功！')
    }
  }

  //  参数
  data = (file) => {
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    return {
      suffix: suffix,
      preffix: 'goodsImg',
    };
  };

  // 更新音频
  handleUpdateVioce = (i, file) => {
    const { dataSource } = this.state
    const that = this
    if (file.status === 'done') {
      dataSource[i].updateStatus = false
      this.setState({ dataSource: this.state.dataSource });
      let timeOut = setTimeout(() => {
        that.props.history.goBack()
        clearTimeout(timeOut)
      }, 1000)
    }
  }

  // 上传前
  handleUploadBefore = (i) => {
    const { dataSource } = this.state
    dataSource[i].updateStatus = true
    this.setState({ dataSource: this.state.dataSource });
  }

  // 音频复原
  handleVioceRecover = async (id) => {
    const data = {
      simple_id: id
    }
    try {
      await API.goodsManageApi.restoreVioce(data)
    } catch (error) {
      return false
    }
  };

  // 下载语音
  handleVioceDowload = async (url) => {
    // window.open(url.voice)
    downloadUrlFile(url.voice)
  }

  async componentDidMount() {
    console.log(this.props.location.query)
    if (!this.props.location.query.isAdd) {
      const {
        word_list: introduce,
        action_tag_list: label,
        wav_url_list: wavs,
        speed_list: speeds,
        simple_sentence_id_list: sentenceId,
        image,
        name,
        price,
        introduce: introduceTxt
      } = this.props.location.query.goods;
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

      let images = [];
      image.forEach((e) => {
        images.push({ status: 'done', url: e });
      });
      this.setState({
        dataSource,
        goodsName: name,
        goodsPrice: price,
        introduce: introduceTxt,
        images,
        isAdd: this.props.location.query.isAdd
      });
    } else {
      this.setState({
        isAdd: this.props.location.query.isAdd
      })
    }

  }

  render() {
    const {
      images,
      columns,
      dataSource,
      goodsName,
      goodsPrice,
      introduce,
      isAdd
    } = this.state;
    const uploadButton = (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    );

    return (
      <div className='h-full overflow-hidden goodsinfo'>
        <div className='flex-1 bg-white goods_h-full p-6'>
          <div className='flex head items-center mb-4'>
            <div className='font_20 flex items-center text-black font-semibold w_140'>
              <span className='ml-3'>编辑商品</span>
            </div>
            {/* <div className='ml-8'>语音合成完成的标记</div> */}
          </div>
          <div className='content'>
            <div className='content_upload flex'>
              <span className='w_140 text-right mr-4'>商品展示</span>
              <div className='upload-area'>
                <div className='upload_type mb-2'>
                  <Radio.Group defaultValue={1}>
                    <Radio value={1}>上传图片</Radio>
                    {/* <Radio value={2}>上传视频</Radio> */}
                  </Radio.Group>
                </div>
                <div className='upload'>
                  <Upload
                    fileList={images}
                    data={this.data}
                    action={`${process.env.REACT_APP_API}/api/common/upload`}
                    listType='picture-card'
                    multiple={true}
                    onChange={this.handleChange}
                  >
                    {images.length >= 8 ? null : uploadButton}
                  </Upload>
                </div>
              </div>
            </div>
            <div className='content_info mt-4'>
              <div className='goods_name flex items-center'>
                <span className='w_140 text-right mr-4'>商品名称</span>
                <Input
                  style={{ width: '50%' }}
                  placeholder='请输入商品名称'
                  value={goodsName}
                  onChange={(e) => this.setState({ goodsName: e.target.value })}
                />
              </div>
              <div className='goods_price flex mb-6 mt-6'>
                <span className='w_140 text-right mr-4'>商品价格</span>
                <Input
                  style={{ width: '50%' }}
                  placeholder='请输入商品价格'
                  value={goodsPrice}
                  onChange={(e) =>
                    this.setState({ goodsPrice: e.target.value })
                  }
                />
              </div>
              <div className='goods_introduce flex'>
                <span className='w_140 text-right mr-4'>商品介绍</span>
                <div className='w-2/4 h_200 relative'>
                  <Input.TextArea
                    style={{ height: '100%', resize: 'none' }}
                    placeholder='请输入商品介绍'
                    value={introduce}
                    onChange={(e) =>
                      this.setState({ introduce: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className='ml_156 font_12'>介绍文案以句号为段落结束</div>
            </div>
          </div>
          {
            dataSource.length > 0 && (
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
            )
          }

          <div className='footer flex justify-center mt-20'>
            <button
              className='cancal_btn foonter_btn py-1 px-8 border rounded-full mr-8'
              onClick={() => {
                this.props.history.goBack();
              }}
            >
              取消
            </button>
            {isAdd ? (
              <button
                className='save_btn foonter_btn py-1 px-8 border rounded-full bg-FF8462 border-color text-white'
                onClick={this.handleAddGoods}
              >
                保存
              </button>
            ) : (
              <button
                className='save_btn foonter_btn py-1 px-8 border rounded-full bg-FF8462 border-color text-white'
                onClick={this.handleUpdataGoods}
              >
                保存
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
export default GoodsInfo;
