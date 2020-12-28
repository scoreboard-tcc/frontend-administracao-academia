import {
  ExclamationCircleOutlined, EyeInvisibleOutlined, LoadingOutlined, LockOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card, Col, Row, Space, Spin, Tag, Typography,
} from 'antd';
import React from 'react';

const { Text } = Typography;

function ScoreboardWithMatchCard({ scoreboard }) {
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
          <Col>
            <Button type="dashed">Clique para configurar uma partida</Button>
          </Col>
        </Row>
      );
    }

    // TODO: utilizar como componente
    return (
      <Row style={{ height: 100 }}>
        <Col>
          dados do placar
        </Col>
      </Row>
    );
  }

  function isControllingMatch() {
    return scoreboard.match; // TODO: implementar baseado nos tokens
  }

  function renderFooter() {
    return (
      <Row gutter={24} style={{ paddingTop: 16 }}>
        <Col flex={1}>
          <Tag
            icon={<ExclamationCircleOutlined />}
            color="warning"
            style={{ visibility: isControllingMatch() ? 'visible' : 'hidden' }}
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

  return (
    <Card title={renderTitle()} bodyStyle={{ padding: 12 }}>
      {renderContent()}
      {renderFooter()}
    </Card>
  );
}

export default ScoreboardWithMatchCard;
