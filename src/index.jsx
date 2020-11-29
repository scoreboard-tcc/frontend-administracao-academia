import { ConfigProvider } from 'antd';
import 'antd/dist/antd.css';
import ptBr from 'antd/es/locale/pt_BR';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import Router from './routes';
import store from './store';

ReactDOM.render(
  // <React.StrictMode>
  <ConfigProvider locale={ptBr}>
    <Provider store={store}>
      <Router />
    </Provider>
  </ConfigProvider>,
  // </React.StrictMode>

  document.getElementById('root'),
);
