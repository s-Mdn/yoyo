import React from 'react'
import { Tabs } from 'antd';
import loginBgImage from '@/assets/images/login_bg.png';
import PasLogin from './components/PasLogin';
import PhoneLogin from './components/PhoneLogin';
import './index.less';

const { TabPane } = Tabs;
class Login extends React.Component {
  render() {
    return (
      <div className='login flex-1'>
        <div className='login_container'>
          <div className='login_container_inner flex h-full'>
            <div className='login_container_inner_left flex-1 flex-shrink-0 border-r hidden lg:flex justify-center items-center'>
              <img className='login_bg' src={loginBgImage} alt='' />
            </div>
            {/* 登陆 form */}
            <div className='login_container_inner_right flex-1 flex justify-center'>
              <Tabs defaultActiveKey='phone' centered tabBarStyle={{marginBottom: '25px'}}>
                <TabPane tab='手机登陆' key='phone'>
                  <PhoneLogin />
                </TabPane>
                <TabPane tab='密码登陆' key='pas'>
                  <PasLogin />
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
