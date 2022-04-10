import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Form, Input, Checkbox } from 'antd';
import utils from '@/utils';
import API from '@/services';
import action from '@/actions';
import userIcon from '@/assets/icons/user_icon.png';
import eyeIcon from '@/assets/icons/eye_icon.png';

const { auth: { getLocal, setLocal }, validate: { validPhone } } = utils;
const { profile: { addProfile } } = action;
const accountCache =
  getLocal('accountCache') && JSON.parse(getLocal('accountCache'));
const TokenKey = 'token';

const Login = (props) => {
  const { token } = props;
  const [account, setAccount] = useState(accountCache?.account);
  const [password, setPassword] = useState(accountCache?.password);
  const [checked, setChecked] = useState(true);
  const [warnings, setWarnings] = useState();

  // 提交
  const handleSubmit = async () => {
    if (!validPhone(account)) {
      setWarnings('账号格式不正确，请重新输入')
      return false;
    } else if (!password) {
      setWarnings('输入密码')
      return false;
    }

    let response = null;
    let data = {
      phone_num: account,
      password,
    };
    try {
      response = await API.loginApi.loginByPassword(data);
    } catch (error) {
      setWarnings('账号或密码不对')
      return false;
    }

    if(response && response.code === 200) {
      setLocal(TokenKey, response.data.token);
      setLocal('userInfo', JSON.stringify(response.data));
      props.handleProfile(response.data);
    }

  };

  // 是否保存账号密码
  useEffect(() => {
    if (checked && validPhone(account)) {
      setLocal('accountCache', JSON.stringify({ account, password }));
    }
  }, [checked, account, password]);

  if (token) {
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
  token: state.profile.token,
});

const mapDispatchToProps = (dispatch) => ({
  handleProfile: (data) => {
    dispatch(addProfile(data));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
