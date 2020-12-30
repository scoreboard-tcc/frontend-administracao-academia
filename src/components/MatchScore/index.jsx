import React, { useEffect, useState } from 'react';
import {
  Col, Row, Space, Typography, message, Badge,
} from 'antd';
import useBroker from 'hooks/use-broker';

const { Text } = Typography;

function MatchScore({ brokerTopic, player1Name, player2Name }) {
  const broker = useBroker();

  const [matchData, setMatchData] = useState({});

  function renderCurrentSet() {
    const currentSet = Number(matchData.Current_Set);
    const offset = 3 * currentSet;

    return (
      <Row gutter={24}>
        <Col span={10} />
        <Col span={3} offset={offset} style={{ textAlign: 'right' }}>
          <Badge color="blue" />
        </Col>
      </Row>
    );
  }

  function renderPlayerRow(playerName, topicSuffix) {
    return (
      <Row gutter={24} align="middle">
        <Col span={10} style={{ fontSize: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>1</Text>
          <Text
            style={{
              marginLeft: 8,
              marginRight: 8,
            }}
            strong
          >
            {playerName}
          </Text>
          {matchData.Player_Serving === topicSuffix && <Badge color="blue" />}
        </Col>
        <Col span={3} style={{ fontSize: 16, textAlign: 'center' }}>
          {matchData[`Set1_${topicSuffix}`]}
        </Col>
        <Col span={3} style={{ fontSize: 16, textAlign: 'center' }}>
          {matchData[`Set2_${topicSuffix}`]}
        </Col>
        <Col span={3} style={{ fontSize: 16, textAlign: 'center' }}>
          {matchData[`Set3_${topicSuffix}`]}
        </Col>
        <Col
          span={3}
          offset={1}
          style={{
            fontSize: 16,
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

  useEffect(() => {
    broker.subscribe(`${brokerTopic}/+`);

    broker.on('message', (fullTopic, data) => {
      try {
        const topic = fullTopic.split('/')[1];

        setMatchData((prevState) => ({ ...prevState, [topic]: data.toString() }));
      } catch (error) {
        message.error('Ocorreu um erro ao receber as informações do broker');
      }
    });

    return () => {
      broker.unsubscribe(`${brokerTopic}/+`);
      broker.removeAllListeners();
    };
  }, [brokerTopic, broker]);

  return (
    <div style={{ paddingTop: 16 }}>
      {renderCurrentSet()}
      <Space direction="vertical" style={{ display: 'flex' }} size="middle">
        {renderPlayerRow(player1Name, 'A')}
        {renderPlayerRow(player2Name, 'B')}
      </Space>
    </div>
  );
}

export default MatchScore;
