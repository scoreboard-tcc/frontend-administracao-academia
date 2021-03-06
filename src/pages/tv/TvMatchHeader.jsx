import { LeftOutlined } from '@ant-design/icons';
import {
  Col, Layout, Row, Spin, Typography,
} from 'antd';
import { format, intervalToDuration } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

const { Title, Text } = Typography;
const { Header } = Layout;

function TvMatchHeader({ match }) {
  const history = useHistory();
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

  function onBackButtonClick() {
    history.goBack();
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updateDuration();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateDuration]);

  return (
    <Header style={{ height: 220, padding: 24 }}>
      <Row align="middle">
        <Col span={8}>
          <LeftOutlined
            onClick={onBackButtonClick}
            style={{ color: 'white', fontSize: 24 }}
          />
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Title
            level={4}
            style={{ color: 'white' }}
          >
            {match.description}
          </Title>
        </Col>
        <Col span={8} />
      </Row>
      <Row justify="center" style={{ height: 50 }}>
        <Col>
          <Text style={{ color: 'white', fontSize: 36 }}>
            Duração da partida
          </Text>
        </Col>
      </Row>
      <Row justify="center">
        <Col>
          <Text style={{ color: 'white', fontSize: 48 }}>
            {duration || <Spin />}
          </Text>
        </Col>
      </Row>
    </Header>
  );
}

export default TvMatchHeader;
