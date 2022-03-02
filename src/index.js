import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom';
import TitleBar from './TitleBar'
import store from '@/store'
import App from './App';


ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <BrowserRouter>
      <Provider store={store}>
        <TitleBar />
        <App />
      </Provider>
    </BrowserRouter>
  </ConfigProvider>,
  document.getElementById('root')
);
