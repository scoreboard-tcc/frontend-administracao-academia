import {
  Badge, Col, message, Result, Row, Space, Typography,
} from 'antd';
import useBroker from 'hooks/use-broker';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  getBrokerTopic, removeControlData, removeSubscribeData,
} from 'utils/tokens';

const { Text } = Typography;

function MatchScore({ match, onMatchFinished, scoreFontSize = 16 }) {
  const broker = useBroker();

  const [matchData, setMatchData] = useState({});
  const [finished, setFinished] = useState(false);

  const matchTopic = useMemo(() => {
    const topic = getBrokerTopic(match);

    if (!topic) {
      message.error('O usuário não tem permissão para acompanhar a partida.');
      return '';
    }

    return topic;
  }, [match]);

  function renderCurrentSet() {
    const currentSet = Number(matchData.Current_Set);
    const offset = 2 * currentSet;

    return (
      <Row gutter={24}>
        <Col span={13} />
        <Col span={2} offset={offset} style={{ fontSize: scoreFontSize, textAlign: 'right' }}>
          <span style={{
            backgroundColor: 'rgb(24, 144, 255)',
            width: 6,
            height: 6,
            borderRadius: '50%',
            display: 'inline-block',
          }}
          />
        </Col>
      </Row>
    );
  }

  function renderPlayerRow(playerName, topicSuffix) {
    return (
      <Row gutter={24} align="middle">
        <Col span={13} style={{ display: 'flex' }}>
          <Text
            strong
            ellipsis
            style={{ display: 'block' }}
          >
            {playerName}
          </Text>
          {matchData.Player_Serving === topicSuffix && (
            <Badge
              style={{
                marginLeft: 4,
              }}
              color="blue"
            />
          )}
        </Col>
        <Col span={2} style={{ fontSize: scoreFontSize, textAlign: 'right' }}>
          {matchData[`Set1_${topicSuffix}`]}
        </Col>
        <Col span={2} style={{ fontSize: scoreFontSize, textAlign: 'right' }}>
          {matchData[`Set2_${topicSuffix}`]}
        </Col>
        <Col span={2} style={{ fontSize: scoreFontSize, textAlign: 'right' }}>
          {matchData[`Set3_${topicSuffix}`]}
        </Col>
        <Col
          span={4}
          offset={1}
          style={{
            fontSize: scoreFontSize,
            backgroundColor: '#1890ff',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 4,
            textAlign: 'center',
          }}
        >
          {matchData[`Score_${topicSuffix}`]}
        </Col>
      </Row>
    );
  }

  const checkIfMatchHasFinished = useCallback((matchWinner) => {
    if (matchWinner !== 'null' && onMatchFinished && !finished) {
      setFinished(true);
      removeControlData(match);
      removeSubscribeData(match);
      onMatchFinished(matchWinner);
    }
  }, [onMatchFinished, finished, match]);

  useEffect(() => {
    if (!matchTopic) {
      return () => {};
    }

    broker.subscribe(`${matchTopic}/+`, { qos: 1 });

    broker.on('message', (fullTopic, data) => {
      try {
        const topic = fullTopic.split('/')[1];

        if (topic === 'Match_Winner') {
          checkIfMatchHasFinished(data.toString());
        }

        setMatchData((prevState) => ({ ...prevState, [topic]: data.toString() }));
      } catch (error) {
        message.error('Ocorreu um erro ao receber as informações do broker');
      }
    });

    return () => {
      broker.unsubscribe(`${matchTopic}/+`);
      broker.removeAllListeners();
    };
  }, [matchTopic, broker, checkIfMatchHasFinished]);

  if (finished) {
    return (
      <Result
        title="Partida finalizada."
        subTitle="Em alguns segundos você será redirecionado para os placares."
      />
    );
  }

  return (
    <div style={{ paddingTop: 16, paddingRight: 8 }}>
      {renderCurrentSet()}
      <Space direction="vertical" style={{ display: 'flex' }} size="middle">
        {renderPlayerRow(match.player1Name, 'A')}
        {renderPlayerRow(match.player2Name, 'B')}
      </Space>
    </div>
  );
}

export default MatchScore;
