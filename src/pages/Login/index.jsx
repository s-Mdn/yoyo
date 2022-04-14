import React from 'react'
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import { LoginActions } from '@/store/actions'
import loginBgImage from '@/assets/images/login_bg.png';
import './index.less';

const PasLogin = React.lazy(()=> import('./components/PasLogin'))
const PhoneLogin = React.lazy(()=> import('./components/PhoneLogin'))



const Login = ( props ) => {
  const { handleUpdateUserInfo } = props

  return (
    <div className='login flex-1'>
      <div className='login_container'>
        <div className='login_container_inner flex h-full'>
          <div className='login_container_inner_left flex-1 flex-shrink-0 border-r hidden lg:flex justify-center items-center'>
            <img className='login_bg' src={loginBgImage} alt='' />
          </div>
          {/* 登陆 form */}
          <div className='login_container_inner_right flex-1 flex justify-center'>
            <Tabs defaultActiveKey='pas' centered tabBarStyle={{marginBottom: '25px'}}>
              <Tabs.TabPane tab='手机登陆' key='phone'>
                <PhoneLogin handleUpdateUserInfo={handleUpdateUserInfo}/>
              </Tabs.TabPane>
              <Tabs.TabPane tab='密码登陆' key='pas'>
                <PasLogin handleUpdateUserInfo={handleUpdateUserInfo}/>
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  handleUpdateUserInfo: (data) => {
    dispatch({
      type: LoginActions.UpdateUserInfo,
      data
    })
  }
});
export default connect(state => ({}), mapDispatchToProps)(Login);
