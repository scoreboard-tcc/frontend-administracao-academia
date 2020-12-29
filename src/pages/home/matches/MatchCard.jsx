import {
  ExclamationCircleOutlined, EyeInvisibleOutlined, LoadingOutlined, LockOutlined,
} from '@ant-design/icons';
import {
  Card, Col, Row, Space, Spin, Tag, Typography,
} from 'antd';
import React from 'react';

const { Text } = Typography;

function MatchCard({ match }) {
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
              {match.scoreboard ? match.scoreboard.description : 'Virtual'}
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
    return false; // TODO: implementar baseado nos tokens
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

  return (
    <Card
      title={renderTitle()}
      bodyStyle={{ padding: 12 }}
      headStyle={{ padding: '0 12px' }}
      style={{ cursor: 'pointer' }}
    >
      {renderContent()}
      {renderFooter()}
    </Card>
  );
}

export default MatchCard;
