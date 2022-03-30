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


export {
  getPlaylist,
  getGoodsList,
  getBackground,
  addBackground,
  deleteBackground
}
