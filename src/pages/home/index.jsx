import {
  Button,
  Col, Layout, message, Result, Row, Skeleton, Typography
} from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import ScoreboardIcon from 'assets/icons/scoreboard.png';
import useAxios from 'hooks/use-axios';
import React, { useCallback, useEffect, useState } from 'react';
import getSubdomain from 'utils/subdomain';

const { Header, Content } = Layout;
const { Title } = Typography;

function HomePage() {
  const axios = useAxios();

  const [academyInfo, setAcademyInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [academyNotFound, setAcademyNotFound] = useState(false);

  const requestAcademyInfo = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`/public/getAcademyPublicDataBySubdomain/${getSubdomain()}`);

      setAcademyInfo(data);
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

  function renderHeader() {
    return (
      <Header>
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar src={ScoreboardIcon} shape="square" size={36} />
          </Col>
          <Col flex={1}>
            <Title level={3} style={{ color: 'white', margin: 0 }}>{academyInfo.name}</Title>
          </Col>
          <Col>
            <Button type="primary">
              Área administrativa
            </Button>
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
              <div dangerouslySetInnerHTML={{ __html: academyInfo.additionalInfo }} />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }

  function renderRealTimeMatches() {
    return (
      <Row>
        <Col>
          <Title level={4}>Placares em tempo real</Title>
        </Col>
      </Row>
    );
  }

  function renderContent() {
    return (
      <Row style={{ padding: 48, height: '100%' }}>
        <Col span={6}>
          {renderAdditionalInfo()}
        </Col>
        <Col flex={16} offset={2}>
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
      {academyInfo && renderHeader()}
      <Content style={{ backgroundColor: '#F1F2F5' }}>
        {academyNotFound && renderAcademyNotFound()}
        {loading && <Skeleton />}
        {academyInfo && renderContent()}
      </Content>
    </Layout>
  );
}

export default HomePage;
