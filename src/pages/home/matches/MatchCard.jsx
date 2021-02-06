import {
  ExclamationCircleOutlined, EyeInvisibleOutlined, LoadingOutlined, LockOutlined,
} from '@ant-design/icons';
import {
  Card, Col, Row, Space, Spin, Tag, Typography,
} from 'antd';
import MatchScore from 'components/MatchScore';
import useBroker from 'hooks/use-broker';
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getControlData, getPublishToken, removeControlData } from 'utils/tokens';

const { Text } = Typography;

function MatchCard({ match, onMatchFinished, onControlChanged }) {
  const history = useHistory();
  const broker = useBroker();

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

  const checkControllerSequence = useCallback(async (currentControllerSequence) => {
    const controlData = getControlData(match.id);

    if (controlData && controlData.controllerSequence !== currentControllerSequence) {
      removeControlData(match.id);

      onControlChanged();
    }
  }, [onControlChanged, match.id]);

  useEffect(() => {
    if (!match) {
      return () => { };
    }

    broker.subscribe(`${match.brokerTopic}/Controller_Sequence`, { qos: 1 });

    broker.on('message', (fullTopic, data) => {
      const topic = fullTopic.split('/')[1];

      if (topic === 'Controller_Sequence') {
        checkControllerSequence(Number(data.toString()));
      }
    });

    return () => {
      broker.unsubscribe(`${match.brokerTopic}/Controller_Sequence`);
      broker.removeAllListeners();
    };
  }, [broker, match, checkControllerSequence]);

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
