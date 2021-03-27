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
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  getControlData, getPublishToken, removeControlData, removeSubscribeData,
} from 'utils/tokens';

const { Text } = Typography;

function ScoreboardWithMatchCard({ scoreboard, onMatchFinished, onControlChanged }) {
  const broker = useBroker();
  const axios = useAxios();
  const { url } = useRouteMatch();
  const history = useHistory();

  const onFinishClick = useCallback(async () => {
    try {
      await axios.post(`/match/finish/${scoreboard.match.id}`);

      removeControlData(scoreboard.match.id);
      removeSubscribeData(scoreboard.match.id);

      message.warn('A partida foi finalizada.');
    } catch (error) {
      message.error('Não foi possível finalizar a partida.');
    }
  }, [axios, scoreboard]);

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
          {scoreboard.match && <Spin size="small" indicator={<LoadingOutlined />} />}
          {scoreboard.match ? 'Em andamento' : 'Disponível'}
          {scoreboard.match && (
          <Dropdown overlay={menu}>
            <MenuOutlined onClick={(e) => e.stopPropagation()} />
          </Dropdown>
          ) }

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

  const checkControllerSequence = useCallback(async (currentControllerSequence) => {
    const controlData = getControlData(scoreboard.match.id);

    if (controlData && controlData.controllerSequence !== currentControllerSequence) {
      removeControlData(scoreboard.match.id);

      onControlChanged();
    }
  }, [scoreboard, onControlChanged]);

  useEffect(() => {
    if (!scoreboard.match) {
      return () => { };
    }

    broker.subscribe(`${scoreboard.match.brokerTopic}/Controller_Sequence`, { qos: 1 });

    broker.on('message', (fullTopic, data) => {
      const topic = fullTopic.split('/')[1];

      if (topic === 'Controller_Sequence') {
        checkControllerSequence(Number(data.toString()));
      }
    });

    return () => {
      broker.unsubscribe(`${scoreboard.match.brokerTopic}/Controller_Sequence`);
      broker.removeAllListeners();
    };
  }, [broker, scoreboard, checkControllerSequence]);

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
