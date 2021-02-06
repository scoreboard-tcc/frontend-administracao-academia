import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col, Divider, Layout, List, message, Row, Skeleton, Typography,
} from 'antd';
import useAxios from 'hooks/use-axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import MatchCard from './MatchCard';
import ScoreboardWithMatchCard from './ScoreboardWithMatchCard';

const { Content } = Layout;
const { Title } = Typography;

function MatchesPage() {
  const axios = useAxios();

  const { url } = useRouteMatch();
  const history = useHistory();

  const [scoreboardsWithMatches, setScoreboardsWithMatches] = useState([]);
  const [virtualMatches, setvirtualMatches] = useState([]);

  const [loading, setLoading] = useState(false);

  const requestScoreboardsWithMatches = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await axios.get('/match/scoreboards');

      setScoreboardsWithMatches(data);
    } catch (error) {
      message.error('Ocorreu um erro ao carregar os placares.');
    } finally {
      setLoading(false);
    }
  }, [axios]);

  const requestVirtualMatches = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await axios.get('/match/virtual');

      setvirtualMatches(data);
    } catch (error) {
      message.error('Ocorreu um erro ao carregar as partidas.');
    } finally {
      setLoading(false);
    }
  }, [axios]);

  const onMatchFinished = useCallback(() => {
    requestScoreboardsWithMatches();
    requestVirtualMatches();
  }, [requestScoreboardsWithMatches, requestVirtualMatches]);

  const onControlChanged = useCallback(() => {
    window.location.reload();
  }, []);

  function renderScoreboardWithMatch(scoreboard) {
    return (
      <List.Item>
        <ScoreboardWithMatchCard
          scoreboard={scoreboard}
          onMatchFinished={onMatchFinished}
          onControlChanged={onControlChanged}
        />
      </List.Item>
    );
  }

  function renderVirtualMatch(match) {
    return (
      <List.Item>
        <MatchCard
          match={match}
          onMatchFinished={onMatchFinished}
          onControlChanged={onControlChanged}
        />
      </List.Item>
    );
  }

  function renderScoreboardsWithMatches() {
    return (
      <>
        {' '}
        <Divider orientation="left">Placares</Divider>
        <List
          grid={{
            gutter: 24, xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 4,
          }}
          dataSource={scoreboardsWithMatches}
          renderItem={renderScoreboardWithMatch}
        />
      </>
    );
  }

  function openCreateMatchPage() {
    history.push(`${url}/create`);
  }

  function renderVirtualMatches() {
    return (
      <>
        <Row align="middle" gutter={24} style={{ marginTop: 48 }}>
          <Col flex={1}>
            <Divider orientation="left">Partidas sem placar físico</Divider>
          </Col>
          <Col lg={{ flex: 0 }} sm={{ flex: 1 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateMatchPage}
            >
              Criar partida sem placar
            </Button>
          </Col>
        </Row>
        <List
          grid={{
            gutter: 24, xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 4,
          }}
          style={{ marginTop: 16 }}
          dataSource={virtualMatches}
          renderItem={renderVirtualMatch}
        />
      </>
    );
  }

  function renderContent() {
    if (loading) {
      return <Skeleton />;
    }

    return (
      <>
        {renderScoreboardsWithMatches()}
        {renderVirtualMatches()}
      </>
    );
  }

  useEffect(() => {
    requestScoreboardsWithMatches();
    requestVirtualMatches();
  }, [requestScoreboardsWithMatches, requestVirtualMatches]);

  return (
    <Layout style={{ backgroundColor: 'white', padding: 16 }}>
      <Row style={{ marginBottom: 24 }} justify="end">
        <Col flex={1}>
          <Title level={4}>Partidas em andamento </Title>
        </Col>
      </Row>
      <Content>
        {renderContent()}
      </Content>
    </Layout>
  );
}

export default MatchesPage;
