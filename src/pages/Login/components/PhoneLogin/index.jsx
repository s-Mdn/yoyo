import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Input } from 'antd';

import { validate } from '@/utils';
import Socket from '@/services/socket';
import API from '@/services';
import phoneIcon from '@/assets/icons/phone_icon.png';
import pasIcon from '@/assets/icons/pas_icon.png';

const { validPhone} = validate;
let timer;

const PhoneLogin = (props) => {
  const { token, handleUpdateUserInfo } = props;
  // 手机号码
  const [phone, setPhone] = useState();
  // 验证码
  const [code, setCode] = useState();
  // 报错提示语
  const [warnings, setWarnings] = useState();
  // 倒计时
  const [time, setTime] = useState(0);
  // 登陆页首次获取验证码
  const [initTime, setIntTime] = useState(false)
  // 点击登陆是否已经响应了
  const [isSubmitRes, setSubmitRes] = useState(false)

  // hook 根据依赖自动计算倒计时
  useEffect(() => {
    timer = setTimeout(() => {
      if (time > 0) {
        clearTimeout(timer)
        setTime((t) => t - 1);
      }
    }, 1000);
  }, [time]);

  // 获取验证码
  const handleValidCode = () => {
    if (!phone) {
      setWarnings('请输入手机号码')
      return false;
    } else if(!validPhone(phone)) {
      setWarnings('手机号码格式不正确')
      return false;
    }

    const data = {
      phone_num: phone,
      sms_use: 'login',
    }
    API.loginApi.getValidCode(data)
      .then(r => {
        setTime(60);
        if(!initTime) { setIntTime(true) }
      }).catch(e => {
        setWarnings(e || '获取验证码当天次数已上限！')
        return false;
      })
  };

  // 表单提交事件
  const handleSubmit = () => {
    const { clent } = window
    if( !clent ) { Socket() }

    if ( !phone ) {
      setWarnings('手机号不能为空');
      return false;
    }
    if (!validPhone( phone )) {
      setWarnings('手机号码格式不正确');
      return false;
    }
    if ( !code ) {
      setWarnings('请填写验证码');
      return false;
    }

    // 请求还没有响应，限制第二次触发
    if( isSubmitRes ) { return false }
    setSubmitRes(true)
    handleLogin({ phone, code });
  };

  // 登录事件
  const handleLogin = ({ phone, code }) => {
    const data = {
      phone_num: phone,
      code: code,
      sms_use: 'login'
    };

    API.loginApi.loginByValidCode(data)
      .then(r => {
        clearTimeout(timer)
        setTime(0)
        setIntTime(false)
        setSubmitRes(false)
        handleUpdateUserInfo(r.data)
      }).catch(e => {
        setSubmitRes(false)
        setWarnings(e || '验证码或手机号正确！')
        return false
      })
  };

  // 登陆成功跳转主页
  if ( token ) {
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
  token: state?.userInfo?.token,
});


export default connect(mapStateToProps)(PhoneLogin);
