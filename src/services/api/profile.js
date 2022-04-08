import request from '../aioxs';

/**
 * @description 基本信息
 * @param {*} data 昵称 姓名 公司
 */
function updataProfile(data) {
  return request({
    url: '/api/user/update_profile',
    method: 'POST',
    data,
  });
}

/**
 * @description 重置密码
 * @param {object} data
 * @returns
 */
function resetPassword(data) {
  return request({
    url: '/api/auth/reset_password',
    method: 'POST',
    data
  })
}

/**
 * @description 重置旧手机号
 * @param {object} data
 * @returns
 */
function checkOldPhone(data) {
  return request({
    url: '/api/auth/check_phone',
    method: 'POST',
    data
  })
}

function changePhone(data) {
  return request({
    url: '/api/auth/reset_phone_num',
    method: 'POST',
    data
  })
}

export {
  updataProfile,
  resetPassword,
  checkOldPhone,
  changePhone
};
