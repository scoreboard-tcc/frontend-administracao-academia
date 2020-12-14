import { MenuOutlined } from '@ant-design/icons';
import {
  Button,
  Col, Layout, message, Popover, Result, Row, Skeleton, Typography,
} from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import useAxios from 'hooks/use-axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import getSubdomain from 'utils/subdomain';

const { Header, Content } = Layout;
const { Title } = Typography;

function LandingPage() {
  const axios = useAxios();
  const screens = useBreakpoint();
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

  function openAdministrativeArea() {
    history.push('/auth');
  }

  function renderHeader() {
    return (
      <Header>
        <Row justify="center" align="middle" gutter={24}>
          <Col>
            <Avatar src={academy.logoUrl} shape="square" size={36} />
          </Col>
          <Col flex={1}>
            <Title level={3} style={{ color: 'white', margin: 0 }}>{academy.name}</Title>
          </Col>
          <Col>
            {screens.xs ? (
              <Popover content={(
                <Button type="primary" onClick={openAdministrativeArea}>
                  Área administrativa
                </Button>
              )}
              >
                <Button type="primary" icon={<MenuOutlined />} />
              </Popover>

            ) : (
              <Button type="primary" onClick={openAdministrativeArea}>
                Área administrativa
              </Button>
            )}
          </Col>
        </Row>
      </Header>
    );
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

  function renderAdditionalInfo() {
    return (
      <Row style={{
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        padding: 24,
      }}
      >
        <Col>
          <Title level={5}>Avisos da academia</Title>
          <Row style={{ marginTop: 24 }}>
            <Col>
              <div dangerouslySetInnerHTML={{ __html: academy.additionalInfo }} />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }

  function renderRealTimeMatches() {
    return (
      <Row justify={screens.xs ? 'center' : 'start'} style={{ marginTop: screens.xs ? 24 : 0 }}>
        <Col>
          <Title level={4}>Placares em tempo real</Title>
        </Col>
      </Row>
    );
  }

  function renderContent() {
    return (
      <Row style={{ padding: screens.xs ? 24 : 48, height: '100%' }}>
        <Col md={6} xs={24}>
          {renderAdditionalInfo()}
        </Col>
        <Col md={{ span: 16, offset: 2 }} xs={{ span: 24, offset: 0 }}>
          {renderRealTimeMatches()}
        </Col>
      </Row>
    );
  }

  useEffect(() => {
    requestAcademyInfo();
  }, [requestAcademyInfo]);

  return (
    <Layout style={{ height: '100%' }}>
      {academy.id && renderHeader()}
      <Content style={{ backgroundColor: '#F1F2F5' }}>
        {academyNotFound && renderAcademyNotFound()}
        {loading && <Skeleton />}
        {academy.id && renderContent()}
      </Content>
    </Layout>
  );
}

export default LandingPage;
