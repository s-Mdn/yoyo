import request from '../aioxs';

/**
 * @description 管理页获取商品列表
 * @param {object} data
 * @returns array
 */
function getGoodsList(data) {
  return request({
    url: '/api/commodity/personal_list',
    method: 'GET',
    data
  })
}

/**
 * @description 管理页获取播放列表
 * @returns array
 */
function getPlaylist() {
  return request({
    url: '/api/play_list',
    method: 'GET',
  })
}

/**
 * @description 删除商品
 * @param {id} id
 * @returns
 */
function deleteGoods(id) {
  return request({
    url: `/api/commodity/${id}`,
    method: 'DELETE',
  })
}

/**
 * @description 删除播放
 * @param {id} id
 * @returns
 */
function deletePlay(id) {
  return request({
    url: `/api/play_list/${id}`,
    method: 'DELETE',
  })
}

/**
 * @description 增加播放
 * @param {object} data
 * @returns
 */
function increasePlays(data) {
  return request({
    url: '/api/play_list',
    method: 'POST',
    data
  })
}

/**
 * @description 编辑播放列表
 * @param {object} data
 * @returns
 */
function editPlays(data) {
  return request({
    url: '/api/play_list/get_commodity',
    method: 'GET',
    data
  })
}

/**
 * @description 更新播放商品
 * @param {object} data
 * @param {string} id
 * @returns
 */
function updataPlayGoods(data) {
  return request({
    url: `/api/play_list/${data.id}`,
    method: 'PATCH',
    data
  })
}

/**
 * @description 敏感词监测
 * @param {string} data
 * @returns
 */
function checkSensitiveWord(data) {
  return request({
    url: '/api/commodity/test_prohibited_words',
    method: 'POST',
    data
  })
}

/**
 * @description 添加播放商品
 * @param {object} data
 * @returns
 */
function addGoods(data) {
  return request({
    url: '/api/commodity',
    method: 'POST',
    data
  })
}

/**
 *
 * @param {object} data
 * @returns
 */
function restoreVioce(data) {
  return request({
    url: '/api/commodity/vioce_restore',
    method: 'POST',
    data
  })
}

/**
 * @description 更新商品
 * @param {object} data 
 * @returns 
 */
function updateGoods(data) {
  return request({
    url: `/api/commodity/${data.id}`,
    method: 'PATCH',
    data
  })
}


export {
  getGoodsList,
  getPlaylist,
  deleteGoods,
  deletePlay,
  increasePlays,
  editPlays,
  updataPlayGoods,
  checkSensitiveWord,
  addGoods,
  restoreVioce,
  updateGoods
}
