import React from 'react';
import { Select, Empty } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import API from '@/services';
import './index.less';

class AutoPlay extends React.Component {
  state = {
    options: [],          // select组件options
    goods: [],            // 商品
    reverse: true,        // 横竖切换, 默认是竖屏 true
    defaultValue: '',     // 下拉框默认选中第一条
    loading: false,       // 下拉框loading
  };

  // Select组件value值改变
  handleChange = (value) => {
    let good = this.state.options.find(good => value === good.id)
    this.setState({ defaultValue: good.label })
    this.getGoodsList(value)
  };

  // 横竖屏切换
  handleReverse = () => {
    this.setState({
      reverse: !this.state.reverse,
    });
  };

  // 改变商品
  handleChangeGoods = (item) => {}

  // 请求商品列表
  getGoodsList = async (params) => {
    let response = null
    let data = {
      play_list_id: params,
      size: (params.size && params.size) || 999,
    }

    this.setState({ loading: true })
    try {
      response = await API.autoPlayApi.getGoodsList(data)
      this.setState({ loading: false })
    } catch (error) {
      this.setState({ loading: false })
      return false
    }

    if(response && response.data.length > 0 > 0) {
      this.setState({
        goods: response.data
      })

    }
  }

  // 请求播放列表，在根据播放列表的第一条数据请求商品列表
  async componentDidMount() {
    let response = null
    try {
      response = await API.autoPlayApi.getPlaylist()
    } catch (error) {
      return false
    }

    if(response && response.data.content.length > 0) {

      response.data.content.map(option => {
        option.label = option.name
        option.value = option.id
      })
      this.setState({
        options: response.data.content,
        defaultValue: response.data.content[0].label
      })
      this.getGoodsList(response.data.content[0].id)
    }
  }


  render() {
    return (
      <div className='auto_play flex justify-between h-full overflow-hidden'>
        {/* 左 */}
        <div className='flex-1 rounded bg-white h-full'>
          <div className='border-b text-center mb-3 h_45 line_height_45'>直播列表</div>
          <div className='mb-3 flex justify-between px-3'>
            <Select
              defaultActiveFirstOption
              value={this.state.defaultValue}
              className='rounded-full flex-1 site-select'
              loading={this.state.loading}
              placeholder='请选择'
              options={this.state.options}
              onChange={this.handleChange}
            />
            <div className='h_w_32 box-border rounded-full flex-none flex justify-center items-center bg-FF8462 m_l_5 cursor-pointer'>
              <AppstoreAddOutlined />
            </div>
          </div>
          <div className='goods relative box-border pr-4 goods_h'>
            {this.state.goods.length > 0 ? (
              <div className='flex flex-wrap'>
                {this.state.goods.map((good) => {
                  return (
                    <div className='flex flex-col goods_item  w_83 ml-4 mb-4 cursor-pointer rounded' onClick={() =>this.handleChangeGoods(good)} key={good.id}>
                      <img src={good.image[0]} alt='' className=' w_83 rounded' />
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
        <div className='m_l_r_24 w_300 flex-1  box-border flex flex-col' style={{ maxWidth: !this.state.reverse? '600px' : '500px', width: !this.state.reverse? '400px' : '300px', minWidth: !this.state.reverse? '400px' : '300px' }}>
          <div   className={[!this.state.reverse && 'flex items-center', 'rounded relative flex-1 bg-white' ].join(' ')}  >
            {/* 横竖屏切换className= */}
            {
              this.state.reverse?(<div className='play_window h-full rounded' />) : (<div className='play_window w-full h_268 rounded'/>)
            }
            <div
              className='font_14 color_FF8462 bg-001529 w_50 text-center absolute right-0 top-2 rounded-l cursor-pointer'
              onClick={this.handleReverse}
            >
              {this.state.reverse ? '横屏' : '竖屏'}
            </div>
          </div>
          <div className='play_contron h_80 rounded bg-white mt-4 flex justify-center items-center'>
            <button className='bg-FF8462 px-6 py-2 rounded-full text-white'>
              开始直播
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
  }
}
export default AutoPlay;
