import React from 'react';
import { Input, message, Pagination } from 'antd';
import { CloseCircleTwoTone, ArrowLeftOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { nanoid } from 'nanoid';
import utils from '@/utils';
import API from '@/services';
import './index.less';

const {
  validate: { isImage },
} = utils;
class PlayInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      page: 1,
      size: 50,
      goodsList: [],
      chosenList: [],
      goodsName: '',
      droppableId: 'droppable',
    };
  }

  // 页码 defaultPageSize改变事件
  handleSizeChange = (current, size) => {
    this.setState({ size }, this.getGoodsList);
  };

  // 当前页码改变事件
  handleChange = (page, pageSize) => {
    this.setState({ page }, this.getGoodsList);
  };

  // 选中已有商品
  handleChoseGoods = (index) => {
    let { goodsList, chosenList } = this.state;
    const goods = JSON.parse(JSON.stringify(goodsList.slice(index, index + 1)));
    goods[0].key = Date.now() + chosenList.length;

    chosenList.push(goods[0]);
    this.setState({ chosenList: this.state.chosenList });
  };

  // 删除选中删除
  handleDeleteChosen = (i) => {
    this.state.chosenList.splice(i, 1);
    this.setState({ chosenList: this.state.chosenList });
  };

  // 保存成功清空所有内容
  handleClearContent = () => {
    const { goodsList, chosenList } = this.state;
    chosenList.splice(0, chosenList.length);
    this.setState({
      goodsList,
      chosenList,
      goodsName: '',
    });
  };

  // 拖动选中的商品
  handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    // 调正源数据的位置
    const { index: sourceIndex } = result.source;
    const { index: changeIndex } = result.destination;

    // 保存替换的源数据
    const temp = this.state.chosenList[sourceIndex];
    // 删除原位置数据
    this.state.chosenList.splice(sourceIndex, 1);
    this.state.chosenList.splice(changeIndex, 0, temp);
    this.setState({ chosenList: this.state.chosenList });
  };

  // 提交
  handleSubmit = async () => {
    let response = null;
    const data = {
      commodity_list: this.state.chosenList.map((e) => e.id),
      name: this.state.goodsName,
      user: this.props.user,
    };
    try {
      if (this.props?.location?.query) {
        data.id = this.props.location.query.id;
        response = await API.goodsManageApi.updataPlayGoods(data);
      } else {
        response = await API.goodsManageApi.increasePlays(data);
      }
    } catch (error) {
      message.error(error || '保存失败！');
      return false;
    }

    if (response && response.code === 200) {
      message.success('保存成功！');
      const that = this;

      // 延迟清空数据
      let timeOut = setTimeout(() => {
        that.handleClearContent();
        this.props.history.goBack();
        clearTimeout(timeOut);
      }, 1500);
    }
  };

  // 获取商品列表
  getGoodsList = async () => {
    let response = null;
    const data = {
      page: this.state.page,
      size: this.state.size,
    };

    try {
      response = await API.goodsManageApi.getGoodsList(data);
    } catch (error) {
      return false;
    }

    if (response && response.code === 200) {
      const {
        data: { pagination, content },
      } = response;

      this.setState({
        total: pagination.total,
        goodsList: content.filter(e => {return e.status !== 'f'}),
      });
    }
  };

  // 获取已经选中的商品
  getSelectedGoods = async (id) => {
    let response = null;
    const data = { play_list_id: id };
    try {
      response = await API.goodsManageApi.selectGoodsList(data);
    } catch (error) {
      return false;
    }
    if (response && response.code === 200) {
      response.data.forEach((e, i) => {
        e.key = nanoid();
      });
      this.setState({
        chosenList: response.data,
      });
    }
  };

  async componentDidMount() {
    await this.getGoodsList();
    const { query } = this.props.location;
    if (query) {
      this.setState({ goodsName: query.goodsName });
      this.getSelectedGoods(query.id);
    }
  }

  render() {
    const { total, goodsList, page, chosenList, goodsName, droppableId } =
      this.state;
    const showTotal = (total) => {
      return `总共 ${total} 页`;
    };
    return (
      <div className='h-full overflow-hidden play-info'>
        <div className='bg-white plays_h_full py-4 px-6 relative'>
          <div className='font_20 flex items-center text-black font-semibold w-auto'>
            <div
              className='flex items-center cursor-pointer w_30px'
              onClick={this.props.history.goBack}
            >
              <ArrowLeftOutlined />
            </div>
            <span className='text-black font-semibold font_20 ml-3'>
              直播列表/新增播放
            </span>
          </div>

          <div className='goods-wrap mt-6 ml_30px'>
            <div className='goods-name flex items-center'>
              <span className='w_80px'>列表名称：</span>
              <div>
                <Input
                  placeholder='请定义名称'
                  value={goodsName}
                  onChange={(e) => this.setState({ goodsName: e.target.value })}
                  maxLength={30}
                  showCount
                  style={{
                    borderWidth: '1px',
                    height: '30px',
                    borderColor: 'rgb(204,204,204)',
                    width: '535px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div className='goods-list mt-6'>
              <div className='w_80px'>已有商品：</div>
              <div className='flex flex-wrap ml_35px'>
                {goodsList.map((e, i) => {
                  return (
                    <div
                      className='ml_45px mb_45px w_100px cursor-pointer relative'
                      key={e.id}
                      onClick={() => this.handleChoseGoods(i)}
                    >
                      <div className='w_100px h_100px rounded overflow-hidden border'>
                        {e.image && isImage(e.image[0]) ? (
                          <img
                            alt=''
                            src={e.image[0]}
                            className='cursor-pointer'
                          />
                        ) : (
                          <video
                            src={e.video_url}
                            className='object-fit h-full w-full'
                          />
                        )}
                      </div>
                      <div className='text-overflow w_100px px-1 font_12 mt-1 text-center'>
                        {e.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='pagination w-full text-center'>
              <Pagination
                showTotal={showTotal}
                total={total}
                current={page}
                showSizeChanger
                showQuickJumper
                defaultPageSize={50}
                pageSizeOptions={[50, 80, 100]}
                onShowSizeChange={this.handleSizeChange}
                onChange={this.handleChange}
              />
            </div>
          </div>

          {chosenList.length > 0 && (
            <div className='chosen-goods mt-6 ml_30px'>
              <div className='w_80px'>已选商品：</div>
              <div className='chosen-goods-wrap ml_35px flex flex-wrap'>
                <DragDropContext onDragEnd={this.handleDragEnd}>
                  <Droppable droppableId={droppableId} direction='horizontal'>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className='flex flex-wrap'
                      >
                        {chosenList.map((e, i) => {
                          return (
                            <Draggable
                              key={e.key}
                              draggableId={[e.key].toString()}
                              index={i}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className='w_100px ml_45px mb_45px relative'
                                  key={e.id}
                                >
                                  <div className='w_100px h_100px rounded overflow-hidden border'>
                                    {e.image && isImage(e.image[0]) ? (
                                      <img
                                        src={e.image[0]}
                                        className='cursor-pointer'
                                        alt=''
                                      />
                                    ) : (
                                      <video
                                        src={e.video_url}
                                        className='object-fit h-full w-full'
                                      />
                                    )}
                                  </div>
                                  <div className='text-overflow w_100px px-1 font_12 mt-1 text-center'>
                                    {e.name}
                                  </div>
                                  <div
                                    className='absolute top-7px right-7px h-auto flex items-center'
                                    onClick={() => this.handleDeleteChosen(i)}
                                  >
                                    <CloseCircleTwoTone twoToneColor='#ee6843' />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          )}
          <div className='footer fixed bottom_15px z-10 left_95px w_100vw-100px flex items-center justify-center bg-white pt_15px py_25px'>
            <button
              className='mr-6 rounded border px-8 height_30px box-border'
              onClick={this.props.history.goBack}
            >
              取 消
            </button>
            {chosenList.length && goodsName ? (
              <button
                className='px-8 rounded bg-FF8462 height_30px text-white'
                onClick={this.handleSubmit}
              >
                保 存
              </button>
            ) : (
              <button
                className='px-8 rounded bg-gray-300 height_30px'
                onClick={this.handleSubmit}
              >
                保 存
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.profile.id,
});

export default connect(mapStateToProps)(PlayInfo);
