import { LoadingOutlined, LockOutlined } from '@ant-design/icons';
import {
  Card, Col, Form, Input, message, Modal, Row, Space, Spin, Tag, Typography,
} from 'antd';
import MatchScore from 'components/MatchScore';
import useAxios from 'hooks/use-axios';
import React, { useMemo, useState } from 'react';
import {
  getBrokerTopic, putSubscribeData,
} from 'utils/tokens';

const { useForm } = Form;
const { Text, Title } = Typography;

function TvMatchCard({ match }) {
  const axios = useAxios();

  const [form] = useForm();

  const matchTopic = useMemo(() => getBrokerTopic(match), [match]);
  const [modalVisible, setModalVisible] = useState(false);

  function renderMatchStatus() {
    return (
      <Text type="secondary" style={{ fontSize: 18 }}>
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
          <Text style={{ fontSize: 18 }}>
            Partida
            {' '}
            {match.id}
          </Text>
        </Col>
        <Col flex={1}>
          <Tag>
            <Text strong style={{ fontSize: 18 }}>
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
    if (!matchTopic) {
      return (
        <div style={{ paddingTop: 24, paddingBottom: 24 }}>
          <Row justify="center">
            <Col>
              <Title level={4}>Partida privada</Title>
            </Col>
          </Row>
          <Row justify="center">
            <Col>
              <Text>Clique aqui para digitar o pin</Text>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <MatchScore
        match={match}
        scoreFontSize={22}
      />
    );
  }

  async function onModalConfirm() {
    const values = await form.validateFields();

    try {
      const { data } = await axios.post('/public/checkPin', {
        matchId: match.id,
        pin: values.pin,
      });

      setModalVisible(false);
      putSubscribeData(match.id, {
        brokerTopic: data.brokerTopic,
      });

      window.location.reload();
    } catch (error) {
      message.error('PIN incorreto.');
    }
  }

  function renderPasswordModal() {
    return (
      <Modal
        title="Digite o PIN da partida"
        visible={modalVisible}
        onOk={onModalConfirm}
        onCancel={() => setModalVisible(false)}
        cancelText="Cancelar"
        okText="Confirmar"
      >
        <Form form={form} size="large">
          <Row justify="center">
            <Col>
              <Form.Item
                name="pin"
                rules={[{
                  required: true,
                  message: 'Por favor, digite o PIN',
                }]}
              >
                <Input placeholder="PIN" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }

  function openMatchDetails() {
    if (!matchTopic) {
      return setModalVisible(true);
    }

    return null;
  }

  function renderFooter() {
    return (
      <Row gutter={24} style={{ paddingTop: 16 }} justify="end">
        { match.pin && (
        <Col>
          <LockOutlined title="Partida com senha" />
        </Col>
        )}

      </Row>
    );
  }

  return (
    <>
      {renderPasswordModal()}
      <Card
        title={renderTitle()}
        bodyStyle={{ padding: 24 }}
        headStyle={{ padding: '0 12px', border: 0 }}
        style={{
          cursor: 'pointer',
          width: '100%',
          height: 280,
          fontSize: '1.5em',
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        }}
        onClick={openMatchDetails}
      >
        {renderContent()}
        {renderFooter()}
      </Card>
    </>
  );
}

export default TvMatchCard;
