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
    const offset = 2 * currentSet;

    return (
      <Row gutter={24}>
        <Col span={13} />
        <Col span={2} offset={offset} style={{ fontSize: 16, textAlign: 'right' }}>
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
        <Col span={2} style={{ fontSize: 16, textAlign: 'right' }}>
          {matchData[`Set1_${topicSuffix}`]}
        </Col>
        <Col span={2} style={{ fontSize: 16, textAlign: 'right' }}>
          {matchData[`Set2_${topicSuffix}`]}
        </Col>
        <Col span={2} style={{ fontSize: 16, textAlign: 'right' }}>
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
