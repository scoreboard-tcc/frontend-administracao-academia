import { ConfigProvider } from 'antd';
import 'antd/dist/antd.css';
import ptBr from 'antd/es/locale/pt_BR';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Router from './routes';

ReactDOM.render(
  // <React.StrictMode>
  <ConfigProvider locale={ptBr}>
    <Router />
  </ConfigProvider>,
  // </React.StrictMode>

  document.getElementById('root'),
);
