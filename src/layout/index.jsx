import React from 'react';
import { connect } from 'react-redux';
import { Layout,  } from 'antd';
import { Redirect } from 'react-router-dom';
import './index.less';
const SiderNav = React.lazy(()=>import('./components/SiderNav'))
const ContentMain = React.lazy(()=>import('./components/ContentMain'))


function _Layout(props) {
  const { token } = props;

  if(!token) {
    return <Redirect to='/login'/>
  }
  return (
    <div className='flex-1 content_h relative'>
      <Layout className='layout'>
        <Layout.Sider defaultCollapsed={true} trigger={null} styl={{overflow: 'auto',height: '100vh',position: 'fixed',left: 0,}}>
          <SiderNav />
        </Layout.Sider>
        <Layout>
          <ContentMain />
        </Layout>
      </Layout>
    </div>
  );
}

const mapStateToProps = (state) => ({
  token: state?.userInfo?.token,
});
export default connect(mapStateToProps)(_Layout);
