import { QrcodeOutlined, ShareAltOutlined } from '@ant-design/icons';
import {
  Button, Col, Input, message, Modal, Popconfirm, Row, Typography,
} from 'antd';
import useAxios from 'hooks/use-axios';
import QRCode from 'qrcode.react';
import React, { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getControlData, putControlData, putSubscribeData } from 'utils/tokens';

const { Text } = Typography;

function LinksTab({ match }) {
  const axios = useAxios();
  const history = useHistory();
  const [qrCodeValue, setQrCodeValue] = useState('');

  const controlData = useMemo(() => getControlData(match.id), [match.id]);

  const refreshUrl = useMemo(() => {
    if (!controlData) {
      return '';
    }

    return `${window.location.host}/token-redirect?refresh_token=${controlData.refreshToken}`;
  }, [controlData]);

  const subscribeUrl = useMemo(() => `${window.location.host}/match/${match.id}?pin=${match.pin || ''}`, [match]);

  async function openShareDialog(url, text) {
    const shareData = {
      title: 'Scoreboard',
      text,
      url,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    }
  }

  function showQrCodeModal(url) {
    setQrCodeValue(url);
  }

  function shareControlQrCode() {
    showQrCodeModal(refreshUrl);
  }

  function shareControlLink() {
    openShareDialog(refreshUrl, 'Link de controle do placar');
  }

  function shareSubscribeQrCode() {
    showQrCodeModal(subscribeUrl);
  }

  function shareSubscribeLink() {
    openShareDialog(subscribeUrl, 'Link para assistir a partida');
  }

  function renderModal() {
    return (
      <Modal
        visible={qrCodeValue}
        footer={null}
        bodyStyle={{ padding: 16, textAlign: 'center' }}
        onCancel={() => setQrCodeValue('')}
        width={250}
        closable={false}
      >
        {qrCodeValue && <QRCode value={qrCodeValue} />}
      </Modal>
    );
  }

  function renderControlInput() {
    if (!controlData) {
      return null;
    }

    return (
      <>
        <Row justify="center">
          <Col>
            <Text strong>Envie este link para quem irá controlar a partida</Text>
          </Col>
        </Row>
        <Row justify="center" style={{ marginTop: 16 }}>
          <Col span={18} lg={8}>
            <Input
              contentEditable={false}
              value={refreshUrl}
              addonBefore={<QrcodeOutlined onClick={shareControlQrCode} />}
              addonAfter={navigator.share && <ShareAltOutlined onClick={shareControlLink} />}
            />
          </Col>
        </Row>
      </>
    );
  }

  function renderSubscribeInput() {
    return (
      <>
        <Row justify="center" style={{ marginTop: 48 }}>
          <Col>
            <Text strong>Envie este link para quem irá acompanhar a partida</Text>
          </Col>
        </Row>
        <Row justify="center" style={{ marginTop: 16 }}>
          <Col span={18} lg={8}>
            <Input
              contentEditable={false}
              value={subscribeUrl}
              addonBefore={<QrcodeOutlined onClick={shareSubscribeQrCode} />}
              addonAfter={navigator.share && <ShareAltOutlined onClick={shareSubscribeLink} />}
            />
          </Col>
        </Row>
      </>
    );
  }

  async function takeControl() {
    try {
      const { data } = await axios.post('/match/takeControl', {
        matchId: match.id,
      });

      putControlData(data.matchId, {
        publishToken: data.publishToken,
        refreshToken: data.refreshToken,
        controllerSequence: data.controllerSequence,
      });

      putSubscribeData(data.matchId, {
        brokerTopic: data.brokerTopic,
      });

      window.location.reload();
    } catch (error) {
      message.error('Não foi possível recuperar o controle da partida.');
    }
  }

  function renderTakeControlButton() {
    if (controlData) {
      return null;
    }

    return <Button onClick={takeControl} danger>Recuperar o controle da partida</Button>;
  }

  function renderFinishMatch() {
    return (
      <Row justify="center" style={{ marginTop: 48 }}>
        <Col>
          <Popconfirm title="Confirmar finalização da partida?" onConfirm={onFinishClick}>
            <Button type="primary" danger> Finalizar partida</Button>
          </Popconfirm>
        </Col>
      </Row>
    );
  }

  const onFinishClick = useCallback(async () => {
    try {
      await axios.post(`/match/finish/${match.id}`);

      message.warn('A partida foi finalizada.');
      history.replace('/home/matches');
    } catch (error) {
      message.error('Não foi possível finalizar a partida.');
    }
  }, [axios, match, history]);

  return (
    <div style={{ paddingTop: 48 }}>
      {renderModal()}
      {renderControlInput()}
      {renderSubscribeInput()}
      {renderFinishMatch()}

      <Row justify="center" style={{ marginTop: 64 }}>
        <Col>
          {renderTakeControlButton()}
        </Col>
      </Row>
    </div>
  );
}

export default LinksTab;
