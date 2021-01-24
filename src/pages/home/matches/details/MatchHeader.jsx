import {
  Col, Layout, Row, Typography,
} from 'antd';
import { format, intervalToDuration } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { Header } = Layout;

function MatchHeader({ match }) {
  const [duration, setDuration] = useState('');

  const updateDuration = useCallback(() => {
    const now = new Date();
    const startedAt = new Date(match.startedAt);

    const { hours, minutes, seconds } = intervalToDuration({ start: startedAt, end: now });

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);

    setDuration(format(date, 'HH:mm:ss'));
  }, [match.startedAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateDuration();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateDuration]);

  return (
    <Header style={{ height: 140, padding: 24 }}>
      <Row justify="center">
        <Col>
          <Title
            level={4}
            style={{ color: 'white' }}
          >
            {match.description}
          </Title>
        </Col>
      </Row>
      <Row justify="center" style={{ height: 20 }}>
        <Col>
          <Text style={{ color: 'white' }}>
            Duração da partida
          </Text>
        </Col>
      </Row>
      <Row justify="center">
        <Col>
          <Text style={{ color: 'white' }}>
            {duration}
          </Text>
        </Col>
      </Row>
    </Header>
  );
}

export default MatchHeader;
