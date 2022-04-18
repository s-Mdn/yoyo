import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Form, Input, Checkbox } from 'antd';
import { auth, type, validate } from '@/utils'
import Socket from '@/services/socket';
import API from '@/services';
import userIcon from '@/assets/icons/user_icon.png';
import eyeIcon from '@/assets/icons/eye_icon.png';

const { getLocal, setLocal } = auth;
const { validPhone } = validate;
const { toObject } = type;
const accountCache = toObject(getLocal('accountCache'));

const Login = (props) => {
  const { token, handleUpdateUserInfo } = props;
  // 账号
  const [account, setAccount] = useState(accountCache?.account);
  // 密码
  const [password, setPassword] = useState(accountCache?.password);
  // 是否记住密码
  const [checked, setChecked] = useState(true);
  // 报错提示语
  const [warnings, setWarnings] = useState();
  // 点击登陆是否已经响应了
  const [isSubmitRes, setSubmitRes] = useState(false)

  // 是否保存账号密码
  useEffect(() => {
    if (checked && validPhone(account)) {
      setLocal('accountCache', JSON.stringify({ account, password }));
    }
  }, [checked, account, password]);

  // 提交
  const handleSubmit = async () => {
    const { clent } = window
    if( !clent ) { Socket() }

    if( !account ) {
      setWarnings('请重新输入帐号！')
      return false;
    }
    if( !validPhone(account) ) {
      setWarnings('账号格式不正确！')
      return false;
    }
    if ( !password ) {
      setWarnings('输入密码！')
      return false;
    }

    // 请求还没有结果，限制第二次触发
    if( isSubmitRes ) { return false }
    setSubmitRes(false)

    const data = { phone_num: account, password }
    API.loginApi.loginByPassword(data)
      .then(r => {
        setSubmitRes(true)
        localStorage.setItem('token', r.data.token)
        localStorage.setItem('userInfo', JSON.stringify(r.data))

        handleUpdateUserInfo(r.data)
      }).catch(e => {
        setSubmitRes(true)
        setWarnings(e || '账号或密码不对')
        return false
      })
  };

  // 登陆成功跳转主页
  if ( token ) {
    return <Redirect to='/' />;
  }

  return (
    <div className='login_input w-80 relative'>
      <Form
        colon={false}
        name='pasForm'
        requiredMark={false}
        onFinish={handleSubmit}
      >
        <div className='form_item mb-7'>
          <Form.Item
            name='phoneNum'
            label={<img src={userIcon} alt='' className='sm:block hidden' />}
          >
            <div className='phone_input border-b'>
              <Input
                value={account}
                placeholder='请输入账号'
                bordered={false}
                onChange={(e) => setAccount(() => e.target.value)}
              />
            </div>
          </Form.Item>
        </div>

        <div className='form_item mb-7'>
          <Form.Item
            name='code'
            label={<img src={eyeIcon} alt='' className='sm:block hidden' />}
          >
            <div className='phone_input border-b'>
              <Input.Password
                value={password}
                placeholder='请输入密码'
                bordered={false}
                onChange={(e) => setPassword(() => e.target.value)}
              />
            </div>
          </Form.Item>
        </div>
        <div className='warm_texttext-gray-400 mb-7 flex justify-between items-center'>
          <div>
            <Checkbox
              defaultChecked={checked}
              onChange={(e) => setChecked(() => e.target.checked)}
            >
              记住密码
            </Checkbox>
          </div>
          {/* <div className='font_14 color-FF8462 cursor-pointer'>忘记密码？</div> */}
        </div>

        <Form.Item>
          <button type='submit' className='w-full  py-2 bg-FF8462 rounded-full text-white'>登 录</button>
        </Form.Item>
      </Form>
      <div className='absolute top-30 font_12'>{warnings}</div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  token: state?.userInfo?.token,
});

export default connect(mapStateToProps, )(Login);
