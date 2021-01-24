import {
  ExclamationCircleOutlined, EyeInvisibleOutlined, LoadingOutlined, LockOutlined,
} from '@ant-design/icons';
import {
  Card, Col, Row, Space, Spin, Tag, Typography,
} from 'antd';
import MatchScore from 'components/MatchScore';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { getPublishToken } from 'utils/tokens';

const { Text } = Typography;

function MatchCard({ match, onMatchFinished }) {
  const history = useHistory();

  function renderMatchStatus() {
    return (
      <Text type="secondary" style={{ fontSize: 14 }}>
        <Space>
          <Spin size="small" indicator={<LoadingOutlined />} />
          Em andamento
        </Space>
      </Text>
    );
  }

  function renderTitle() {
    return (
      <Row gutter={16}>
        <Col>
          <Text>
            Partida
            {' '}
            {match.id}
          </Text>
        </Col>
        <Col flex={1}>
          <Tag>
            <Text strong style={{ fontSize: 14 }}>
              {match.scoreboard ? match.scoreboard.description : 'Sem placar'}
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
    return (
      <MatchScore
        match={match}
        onMatchFinished={onMatchFinished}
      />
    );
  }

  function isControllingMatch() {
    return getPublishToken(match);
  }

  function renderFooter() {
    return (
      <Row gutter={24} style={{ paddingTop: 16 }}>
        <Col flex={1}>
          <Tag
            icon={<ExclamationCircleOutlined />}
            color="warning"
            style={{ visibility: isControllingMatch() ? 'hidden' : 'visible' }}
          >
            Alguem está controlando essa partida
          </Tag>
        </Col>

        { match.listed && !match.listed && (
        <Col>
          <EyeInvisibleOutlined title="Partida não listada" />
        </Col>
        )}

        { match.pin && (
        <Col>
          <LockOutlined title="Partida com senha" />
        </Col>
        )}

      </Row>
    );
  }

  function onCardClick() {
    history.push(`match/${match.id}`);
  }

  return (
    <Card
      title={renderTitle()}
      bodyStyle={{ padding: 12 }}
      headStyle={{ padding: '0 12px' }}
      style={{ cursor: 'pointer' }}
      onClick={onCardClick}
    >
      {renderContent()}
      {renderFooter()}
    </Card>
  );
}

export default MatchCard;
