import {
  ExclamationCircleOutlined, LoadingOutlined, LockOutlined,
} from '@ant-design/icons';
import {
  Card, Col, Row, Space, Spin, Tag, Typography, Modal, Form, Input, message,
} from 'antd';
import MatchScore from 'components/MatchScore';
import useAxios from 'hooks/use-axios';
import useBroker from 'hooks/use-broker';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import {
  getBrokerTopic, getControlData, getPublishToken, putSubscribeData, removeControlData,
} from 'utils/tokens';

const { useForm } = Form;
const { Text, Title } = Typography;

function MatchCard({ match, onControlChanged }) {
  const axios = useAxios();
  const broker = useBroker();
  const history = useHistory();
  const [form] = useForm();

  const matchTopic = useMemo(() => getBrokerTopic(match), [match]);
  const publishToken = useMemo(() => getPublishToken(match), [match]);
  const [modalVisible, setModalVisible] = useState(false);

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
    // TODO: se tiver pin e não tiver o brokerTopic salvo, mostrar cadeado
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
        expirationDate: data.expiration,
      });

      history.push(`/match/${match.id}`);
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

    return history.push(`/match/${match.id}`);
  }

  function isControllingMatch() {
    return publishToken;
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
            Você está controlando essa partida
          </Tag>
        </Col>

        { match.pin && (
        <Col>
          <LockOutlined title="Partida com senha" />
        </Col>
        )}

      </Row>
    );
  }

  const checkControllerSequence = useCallback(async (currentControllerSequence) => {
    const controlData = getControlData(match.id);

    if (controlData && controlData.controllerSequence !== currentControllerSequence) {
      removeControlData(match.id);

      onControlChanged();
    }
  }, [onControlChanged, match.id]);

  useEffect(() => {
    if (!matchTopic) {
      return () => { };
    }

    broker.subscribe(`${matchTopic}/Controller_Sequence`, { qos: 1 });

    broker.on('message', (fullTopic, data) => {
      const topic = fullTopic.split('/')[1];

      if (topic === 'Controller_Sequence') {
        checkControllerSequence(Number(data.toString()));
      }
    });

    return () => {
      broker.unsubscribe(`${matchTopic}/Controller_Sequence`);
      broker.removeAllListeners();
    };
  }, [broker, matchTopic, checkControllerSequence]);

  return (
    <>
      {renderPasswordModal()}
      <Card
        title={renderTitle()}
        bodyStyle={{ padding: 12 }}
        headStyle={{ padding: '0 12px' }}
        style={{ cursor: 'pointer' }}
        onClick={openMatchDetails}
      >
        {renderContent()}
        {renderFooter()}
      </Card>
    </>
  );
}

export default MatchCard;
