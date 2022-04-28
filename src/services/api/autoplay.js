import request from '../aioxs';

/**
 * @description 获取播放列表
 * @returns {array}
 */
function getPlaylist() {
  return request({
    url: '/api/play_list',
    method: 'get',
  })
}

/**
 * @description 根据选择播放列表ID获取商品
 * @param {id} data
 * @returns {array}
 */
function getGoodsList(data) {
  return request({
    url: '/api/play_list/get_commodity',
    method: 'get',
    data
  })
}

/**
 * @description 获取背景图
 * @returns
 */
function getBackground() {
  return request({
    url: '/api/background',
    method: 'GET'
  })
}

/**
 * @description 删除背景图
 * @param {number} id
 * @returns
 */
function deleteBackground(id) {
  return request({
    url: `/api/background/${id}`,
    method: 'DELETE'
  })
}

/**
 * @description 添加背景图
 * @param {object} data
 * @returns
 */
function addBackground(data) {
  return request({
    url: '/api/background/add_background',
    method: 'POST',
    data
  })
}

/**
 * @description 更新播放列表和商品列表的播放状态
 * @param {object} data 
 * @returns 
 */
 function updateGoodsAndPlaysState(data) {
  return request({
    url: '/api/play_list/update_live_status',
    method: 'POST',
    data
  })
}

/**
 * @description 还原播放列表和商品列表的播放状态
 *  @param {object} data 
 * @returns 
 */
function resetGoodsAndPlaysState(data) {
  return request({
    url: '/api/play_list/recover_status',
    method: 'POST',
    data
  })
}


export {
  getPlaylist,
  getGoodsList,
  getBackground,
  addBackground,
  deleteBackground,
  updateGoodsAndPlaysState,
  resetGoodsAndPlaysState,
}
