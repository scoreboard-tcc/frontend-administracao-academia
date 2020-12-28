import {
  Avatar, Button, Col, Form, Input, Layout, message, Result, Row, Skeleton, Typography,
} from 'antd';
import useAxios from 'hooks/use-axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import getSubdomain from 'utils/subdomain';
import getAuthenticationToken from 'utils/token';

const { Content } = Layout;
const { Title } = Typography;

function AuthPage() {
  const axios = useAxios();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [academyNotFound, setAcademyNotFound] = useState(false);
  const [academy, setAcademy] = useState({});

  const requestAcademyInfo = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`/public/getAcademyBySubdomain/${getSubdomain()}`);

      setAcademy(data);
      setAcademyNotFound(false);
    } catch (error) {
      message.error('Ocorreu um erro ao carregar os dados da academia.');

      if (error.response && error.response.status === 404) {
        setAcademyNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }, [axios]);

  async function onFinish({ email, password }) {
    try {
      const { data } = await axios.post('/authentication/coordinator', { email, password, academySubdomain: getSubdomain() });

      localStorage.setItem('Authorization', data.token);
      history.replace('/home/matches');
    } catch (error) {
      message.error('Verifique se as credenciais estão corretas.');
    }
  }

  function renderAcademyNotFound() {
    return (
      <Result
        status="404"
        title="Academia não encontrada"
        subTitle="Verifique se o endereço digitado está correto."
      />
    );
  }

  function renderContent() {
    return (
      <Row
        justify="center"
        align="middle"
        style={{ height: '100%' }}
      >
        <Col sm={4} xs={16} style={{ textAlign: 'center' }}>
          <Avatar size={100} src={academy.logoUrl} style={{ marginBottom: 16 }} />
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
    );
  }

  useEffect(() => {
    if (getAuthenticationToken()) {
      history.replace('/home/matches');
    } else {
      requestAcademyInfo();
    }
  }, [history, requestAcademyInfo]);

  return (
    <Layout style={{ height: '100%' }}>
      <Content>
        {academyNotFound && renderAcademyNotFound()}
        {loading && <Skeleton />}
        {academy.id && renderContent()}
      </Content>
    </Layout>
  );
}

export default AuthPage;
