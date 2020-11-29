import { TeamOutlined } from '@ant-design/icons';
import {
  Avatar, Button, Col, Form, Input, Layout, message, Row, Typography
} from 'antd';
import useAxios from 'hooks/use-axios';
import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

function AuthPage() {
  const axios = useAxios();
  const history = useHistory();

  const academy = useSelector((state) => state.academy);

  async function onFinish({ email, password }) {
    try {
      const { data } = await axios.post('/authentication', { email, password, academyId: academy.id });

      localStorage.setItem('Authorization', data.token);
      history.replace('/home');
    } catch (error) {
      message.error('Verifique se as credenciais estão corretas.');
    }
  }

  return (
    <Layout style={{ height: '100%' }}>
      <Content>
        <Row
          justify="center"
          align="middle"
          style={{ height: '100%' }}
        >
          <Col sm={4} xs={16} style={{ textAlign: 'center' }}>
            {/* TODO: adicionar logo da academia */}
            <Avatar size={100} icon={<TeamOutlined />} style={{ marginBottom: 16 }} />
            <Title level={3} type="secondary" style={{ marginBottom: 32 }}>{academy.name}</Title>
            <Form size="large" onFinish={onFinish}>
              <Form.Item
                name="email"
                rules={[{ required: true, message: 'Digite um e-mail.' },
                  { type: 'email', message: 'Digite um e-mail válido.' }]}
              >
                <Input placeholder="Email" autoComplete="username" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Digite uma senha.' }, { min: 6, message: 'A senha deve conter pelo menos 6 caracteres.' }]}
              >
                <Input.Password placeholder="Senha" autoComplete="current-password" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                >
                  Entrar
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default AuthPage;
