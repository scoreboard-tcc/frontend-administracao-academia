import {
  ExclamationCircleOutlined, EyeInvisibleOutlined, LoadingOutlined, LockOutlined, MenuOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card, Col, Dropdown, Menu, message, Popconfirm, Row, Space, Spin, Tag, Typography,
} from 'antd';
import MatchScore from 'components/MatchScore';
import useAxios from 'hooks/use-axios';
import useBroker from 'hooks/use-broker';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import {
  getControlData, getPublishToken, removeControlData, removeSubscribeData,
} from 'utils/tokens';

const { Text } = Typography;

function MatchCard({ match, onMatchFinished, onControlChanged }) {
  const axios = useAxios();
  const history = useHistory();
  const broker = useBroker();

  const onFinishClick = useCallback(async () => {
    try {
      await axios.post(`/match/finish/${match.id}`);

      removeControlData(match.id);
      removeSubscribeData(match.id);

      message.warn('A partida foi finalizada.');
    } catch (error) {
      message.error('Não foi possível finalizar a partida.');
    }
  }, [axios, match]);

  const menu = useMemo(() => (
    <Menu onClick={(e) => {
      e.domEvent.stopPropagation();
    }}
    >
      <Menu.Item danger>
        <Popconfirm title="Confirmar finalização da partida?" onConfirm={onFinishClick}>
          <Button type="text" danger> Finalizar partida</Button>
        </Popconfirm>
      </Menu.Item>

    </Menu>
  ), [onFinishClick]);

  function renderMatchStatus() {
    return (
      <Text type="secondary" style={{ fontSize: 14 }}>
        <Space>
          <Spin size="small" indicator={<LoadingOutlined />} />
          Em andamento
          <Dropdown overlay={menu}>
            <MenuOutlined onClick={(e) => e.stopPropagation()} />
          </Dropdown>
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
