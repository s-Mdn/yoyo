import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Input } from 'antd';
import action from '@/actions';
import utils from '@/utils';
import API from '@/services';
import phoneIcon from '@/assets/icons/phone_icon.png';
import pasIcon from '@/assets/icons/pas_icon.png';

const { auth: { setLocal }, validate: { validPhone } } = utils;
const { profile: { addProfile } } = action;
const TokenKey = 'token';
let timeOut;

const PhoneLogin = (props) => {
  const { token, handleProfile } = props;
  const [phone, setPhone] = useState();
  const [code, setCode] = useState();
  const [warnings, setWarnings] = useState();
  const [time, setTime] = useState(0);
  const [initTime, setIntTime] = useState(false)

  // hook 根据依赖自动计算倒计时
  useEffect(() => {
    timeOut = setTimeout(() => {
      if (time > 0) {
        clearTimeout(timeOut)
        setTime((t) => t - 1);
      }
    }, 1000);
  }, [time]);

  // 获取验证码
  const handleValidCode = async () => {
    if (!phone) {
      setWarnings('请输入手机号码')
      return false;
    } else if(!validPhone(phone)) {
      setWarnings('手机号码格式不正确')
      return false;
    }



    let res = null
    const data = {
      phone_num: phone,
      sms_use: 'login',
    };
    try {
      res = await API.loginApi.getValidCode(data);
    } catch (error) {
      console.log(error)
      setWarnings(error || '获取验证码当天次数已上限！')
      return false;
    }

    // 指定倒计时间
    setTime(60);
    // 首次获取验证码状态
    if(!initTime) { setIntTime(true) }
  };

  // 登录事件
  const handleLogin = async (data) => {
    const params = {
      phone_num: data.phone,
      code: data.code,
      sms_use: 'login'
    };
    let response = null;

    try {
      response = await API.loginApi.loginByValidCode(params);
    } catch (error) {
      setWarnings(error || '请刷新重试')
      return false;
    }

    if( response && response.code === 200 ) {
      setLocal(TokenKey, response.data.token);
      setLocal('userInfo', JSON.stringify(response.data));
      handleProfile(response.data);
    }
  };

  // 表单提交事件
  const handleSubmit = () => {
    if ( !phone ) {
      setWarnings('请填写手机号');
      return false;
    } else if ( !validPhone(phone) ) {
      setWarnings('手机号码格式不正确');
      return false;
    } else if (!code ) {
      setWarnings('请填写验证码');
      return false;
    }

    handleLogin({ phone, code });
  };

  if ( token ) {
    clearTimeout(timeOut)
    return <Redirect to='/' />;
  }

  return (
    <div className='login_input w-80 relative'>
      <div className='phone flex items-center mb-10'>
        <img src={phoneIcon} alt='' className='mr-2' />
        <div className='border-b w-full relative'>
          <Input
            value={phone}
            maxLength={11}
            placeholder='请输入手机号码'
            bordered={false}
            onChange={(e) => setPhone(e.target.value)}
            onPressEnter={handleSubmit}
          />
          {!time ? (
            <button
              className='py-1 px-3 border rounded-full absolute right-0 border_b_2 border-color-F7B9A3 font_12'
              onClick={handleValidCode}
            >
              {initTime ? '重新发送' : '获取验证码'}
            </button>
          ) : (
            <button
              className='py-1 px-3 border rounded-full absolute right-0 border_b_2 border-color-F7B9A3 font_12'
            >
              {time}秒后重发
            </button>
          )}
        </div>
      </div>

      <div className='code flex items-center'>
        <img src={pasIcon} alt='' className='mr-2' />
        <div className='border-b w-full relative'>
          <Input
            value={code}
            maxLength={6}
            placeholder='请输入验证码'
            bordered={false}
            onPressEnter={handleSubmit}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
      </div>

      <div className='warm_text text-xs text-gray-400 text-center my-7'>
        *未注册手机将默认注册新账户
      </div>

      <div className='yoyo-btn w-full'>
        <button
          className='w-full bg-FF8462 py-2 rounded-full text-white'
          onClick={handleSubmit}
        >
          登 录
        </button>
      </div>

      {warnings && <div className='absolute top-30 font_12'>{warnings}</div>}
    </div>
  );
};

const mapStateToProps = ( state ) => ({
  token: state.profile.token,
});

const mapDispatchToProps = ( dispatch ) => ({
  handleProfile: ( data ) => {
    dispatch(addProfile( data ));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PhoneLogin);
