import {
  Avatar, Col, Layout, List, message, Result, Row, Skeleton, Typography,
} from 'antd';
import useAxios from 'hooks/use-axios';
import React, { useCallback, useEffect, useState } from 'react';
import getSubdomain from 'utils/subdomain';
import TvMatchCard from './TvMatchCard';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function TvPage() {
  const axios = useAxios();

  const [loading, setLoading] = useState(false);
  const [academyNotFound, setAcademyNotFound] = useState(false);
  const [academy, setAcademy] = useState({});
  const [matches, setMatches] = useState([]);

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

  const requestMatches = useCallback(async () => {
    if (!academy.id) {
      return null;
    }

    setLoading(true);

    try {
      const { data } = await axios.get(`/public/getMatchesByAcademyId/${academy.id}`);

      setMatches(data);
    } catch (error) {
      message.error('Ocorreu um erro ao carregar as partidas.');
    } finally {
      setLoading(false);
    }
  }, [axios, academy.id]);

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

  function renderMatch(match) {
    return (
      <List.Item>
        <TvMatchCard match={match} />
      </List.Item>
    );
  }

  function renderRealTimeMatches() {
    return (
      <>
        <Row>
          <Col span={24}>
            <List
              grid={{
                gutter: 24,
                column: 3,
              }}
              dataSource={matches}
              renderItem={renderMatch}
              locale={{ emptyText: 'Nenhuma partida em andamento.' }}
            />
          </Col>
        </Row>
      </>
    );
  }

  function renderContent() {
    return (
      <Row style={{ padding: 24, height: '100%' }}>
        <Col span={24}>
          {renderRealTimeMatches()}
        </Col>
      </Row>
    );
  }

  useEffect(() => {
    requestAcademyInfo()
      .then(requestMatches);
  }, [requestAcademyInfo, requestMatches]);

  return (
    <Layout style={{ height: '100%' }}>
      {academy.id && renderHeader()}
      <Content style={{ backgroundColor: '#F1F2F5', minHeight: 'unset' }}>
        {academyNotFound && renderAcademyNotFound()}
        {loading && <Skeleton />}
        {academy.id && renderContent()}
      </Content>
    </Layout>
  );
}
