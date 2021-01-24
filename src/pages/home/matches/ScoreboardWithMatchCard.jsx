import {
  ExclamationCircleOutlined, EyeInvisibleOutlined, LoadingOutlined, LockOutlined,
} from '@ant-design/icons';
import {
  Card, Col, Row, Space, Spin, Tag, Typography,
} from 'antd';
import MatchScore from 'components/MatchScore';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { getPublishToken } from 'utils/tokens';

const { Text } = Typography;

function ScoreboardWithMatchCard({ scoreboard, onMatchFinished }) {
  const { url } = useRouteMatch();
  const history = useHistory();

  function renderMatchStatus() {
    return (
      <Text type="secondary" style={{ fontSize: 14 }}>
        <Space>
          {scoreboard.match && <Spin size="small" indicator={<LoadingOutlined />} />}
          {scoreboard.match ? 'Em andamento' : 'Disponível'}
        </Space>
      </Text>
    );
  }

  function renderTitle() {
    return (
      <Row gutter={16}>
        {scoreboard.match && (
        <Col>
          <Text>
            Partida
            {' '}
            {scoreboard.match.id}
          </Text>
        </Col>
        )}

        <Col flex={1}>
          <Tag>
            <Text strong style={{ fontSize: 14 }}>
              {scoreboard.description}
            </Text>
          </Tag>
        </Col>
        <Col>
          {renderMatchStatus()}
        </Col>
      </Row>
    );
  }

  function renderContent() {
    if (!scoreboard.match) {
      return (
        <Row justify="center" align="middle" style={{ height: 100 }}>
          <Col style={{ paddingTop: 40 }}>
            <Text strong type="secondary">Clique para configurar uma partida</Text>
          </Col>
        </Row>
      );
    }

    return (
      <MatchScore
        match={scoreboard.match}
        onMatchFinished={onMatchFinished}
      />
    );
  }

  function isControllingMatch() {
    return getPublishToken(scoreboard.match);
  }

  function renderFooter() {
    return (
      <Row gutter={24} style={{ paddingTop: 16 }}>
        <Col flex={1}>
          <Tag
            icon={<ExclamationCircleOutlined />}
            color="warning"
            style={{ visibility: isControllingMatch() || !scoreboard.match ? 'hidden' : 'visible' }}
          >
            Alguem está controlando essa partida
          </Tag>
        </Col>

        {scoreboard.match && !scoreboard.match.listed && (
          <Col>
            <EyeInvisibleOutlined title="Partida não listada" />
          </Col>
        )}

        {scoreboard.match && scoreboard.match.pin && (
        <Col>
          <LockOutlined title="Partida com senha" />
        </Col>
        )}

      </Row>
    );
  }

  function onCardClick() {
    if (!scoreboard.match) {
      history.push(`${url}/create?id=${scoreboard.id}&ds=${scoreboard.description}`);
      return;
    }

    history.push(`match/${scoreboard.match.id}`);
  }

  return (
    <Card
      title={renderTitle()}
      bodyStyle={{ padding: 12 }}
      headStyle={{ padding: '0 12px' }}
      onClick={onCardClick}
      style={{ cursor: 'pointer' }}
    >
      {renderContent()}
      {renderFooter()}
    </Card>
  );
}

export default ScoreboardWithMatchCard;
