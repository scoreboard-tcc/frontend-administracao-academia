import { DownOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import {
  Button, Col, Form, Input, message, Modal, Radio, Row, Select, Space, Steps, Switch,
  Tag, Typography,
} from 'antd';
import useAxios from 'hooks/use-axios';
import debounce from 'lodash/debounce';
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { putControlData } from 'utils/tokens';
import './CreateMatchPage.css';

const { Title, Text } = Typography;
const { Step } = Steps;
const { useForm } = Form;

function PlayerInput({ name, placeholder, form }) {
  const axios = useAxios();

  const [selecting, setSelecting] = useState(true);
  const [players, setPlayers] = useState([]);

  const inputRef = useRef();
  const selectRef = useRef();

  const onSearch = useCallback(async (playerName) => {
    try {
      const { data } = await axios.get('/player', {
        params: {
          onlyFromAcademy: true,
          search: playerName,
        },
      });

      setPlayers(data.data);
    } catch (error) {
      message.error('Ocorreu um erro ao buscar os jogadores da academia.');
    }
  }, [axios]);

  const playerOptions = useMemo(() => players.map((player) => ({
    label: player.name,
    value: player.id,
  })), [players]);

  function onEditClick() {
    setSelecting(false);

    form.setFieldsValue({
      [name]: '',
    });
  }

  function onSelectClick() {
    setSelecting(true);

    form.setFieldsValue({
      [name]: '',
    });
  }

  function renderSelect() {
    return (
      <Select
        ref={selectRef}
        options={playerOptions}
        style={{ width: 250 }}
        placeholder={placeholder}
        showSearch
        onSearch={debounce(onSearch, 200)}
        size="large"
        labelInValue
        optionFilterProp="label"
        allowClear
      />

    );
  }

  function renderInput() {
    return (
      <Input
        ref={inputRef}
        style={{ width: 250 }}
        placeholder="Nome do jogador"
        allowClear
        size="large"
      />
    );
  }

  useEffect(() => {
    if (selecting) {
      selectRef.current.focus();
    } else {
      inputRef.current.focus();
    }
  }, [selecting]);

  useEffect(() => {
    onSearch('');
  }, [onSearch]);

  return (
    <Row>
      <Col>
        <Form.Item
          name={name}
          rules={[{
            required: selecting,
            message: 'Por favor, selecione um jogador.',
          }]}
        >
          {selecting ? renderSelect() : renderInput()}
        </Form.Item>
      </Col>
      <Col>
        {selecting ? (
          <Button
            icon={<EditOutlined />}
            onClick={onEditClick}
            size="large"
            title="Informar nome manualmente"
          />
        ) : (
          <Button
            icon={<DownOutlined />}
            onClick={onSelectClick}
            size="large"
            title="Selecionar jogador"
          />
        )}
      </Col>
    </Row>
  );
}

function CreateMatchPage() {
  const axios = useAxios();
  const [form] = useForm();
  const history = useHistory();

  const { search } = useLocation();
  const query = new URLSearchParams(search);

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showMatchConfirmation, setShowMatchConfirmation] = useState(false);
  const [step, setStep] = useState(0);

  const [enableCreateButton, setEnableCreateButton] = useState(false);

  const scoreboardId = query.get('id') || null;
  const scoreboardDescription = query.get('ds') || 'Sem placar';

  function renderTitle() {
    return (
      <div>
        <Row gutter={24} justify="center">
          <Col>
            <Title level={4}>Configurando partida</Title>
          </Col>
        </Row>
        <Row gutter={24} justify="center">
          <Col>
            <Tag>{scoreboardDescription}</Tag>
          </Col>
        </Row>
      </div>
    );
  }

  async function onSubmit(values) {
    console.log({ values });
    try {
      const { data } = await axios.post('/match', {
        scoreboardId,
        player1Id: typeof values.player1 === 'object' ? values.player1.value : null,
        player2Id: typeof values.player2 === 'object' ? values.player2.value : null,
        player1Name: typeof values.player1 === 'string' ? values.player1 : null,
        player2Name: typeof values.player2 === 'string' ? values.player2 : null,
        listed: values.listed,
        pin: values.pin && values.pin.length ? values.pin : '',
        tieBreakType: values.tieBreakType,
        scoringType: values.scoringType,
        hasAdvantage: values.hasAdvantage,
      });

      await message.success(
        {
          content: 'A partida foi criada com sucesso! Em breve você será redirecionado para a tela de controle.',
          duration: 2,
        },
      );

      putControlData(data.id, {
        controllerSequence: data.controllerSequence,
        publishToken: data.publishToken,
        refreshToken: data.refreshToken,
      });

      history.push(`/home/match/${data.id}`);
    } catch (error) {
      const { response = {} } = error;
      const { data = {} } = response;
      const { message: msg = 'Ocorreu um erro ao criar a partida.' } = data;

      message.error(msg);
    }
  }

  function onAdvancedSettingsClick() {
    setShowAdvancedSettings(true);
  }

  function renderMatchRules() {
    return (
      <div style={{ display: step === 0 ? 'block' : 'none' }}>
        <Row style={{ marginTop: 32, marginBottom: 16 }} justify="center">
          <Col>
            <Text style={{ fontSize: 16 }}>Tipo do último set</Text>
          </Col>
        </Row>
        <Row justify="center" className="form-row">
          <Col span={24} lg={16} style={{ display: 'flex' }}>
            <Form.Item name="tieBreakType" noStyle>
              <Radio.Group buttonStyle="solid">
                <Row>
                  <Col span={12} style={{ display: 'flex' }}>
                    <Radio.Button value="REGULAR">Regular</Radio.Button>
                  </Col>
                  <Col span={12} style={{ display: 'flex' }}>
                    <Radio.Button value="TEN_POINTS">Até 10 pontos</Radio.Button>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ marginTop: 32, marginBottom: 16 }} justify="center">
          <Col>
            <Text style={{ fontSize: 16 }}>Pontuação</Text>
          </Col>
        </Row>
        <Row justify="center" className="form-row">
          <Col span={24} lg={16} style={{ display: 'flex' }}>
            <Form.Item name="scoringType" noStyle>
              <Radio.Group buttonStyle="solid">
                <Row justify="center">
                  <Col span={12} style={{ display: 'flex' }}>
                    <Radio.Button value="BASIC">Básica</Radio.Button>
                  </Col>
                  <Col span={12} style={{ display: 'flex' }}>
                    <Radio.Button value="ADVANCED">Avançada</Radio.Button>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row style={{ marginTop: 32, marginBottom: 16 }} justify="center">
          <Col>
            <Text style={{ fontSize: 16 }}>Vantagem</Text>
          </Col>
        </Row>
        <Row justify="center">
          <Col>
            <Form.Item name="hasAdvantage" valuePropName="checked">
              <Switch>Vantagem</Switch>
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }

  function renderMatchSettings() {
    return (
      <div style={{ display: step === 1 ? 'block' : 'none' }}>
        <Row style={{ marginTop: 16, marginBottom: 16 }} justify="center">
          <Col>
            <Text style={{ fontSize: 16 }}>Listada</Text>
          </Col>
        </Row>
        <Row justify="center">
          <Col>
            <Form.Item name="listed" valuePropName="checked">
              <Switch>Listada</Switch>
            </Form.Item>
          </Col>
        </Row>

        <Row style={{ marginTop: 16, marginBottom: 16 }} justify="center">
          <Col>
            <Text style={{ fontSize: 16 }}>PIN</Text>
          </Col>
        </Row>
        <Row justify="center">
          <Col>
            <Form.Item name="pin">
              <Input min={10} max={60 * 5} style={{ width: 200 }} placeholder="PIN para visualizar a partida" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }

  function onStepChange(s) {
    setStep(s);
  }

  function renderAdvancedSettings() {
    return (
      <Modal
        title="Configurações avançadas"
        visible={showAdvancedSettings}
        forceRender
        onOk={() => setShowAdvancedSettings(false)}
        onCancel={() => setShowAdvancedSettings(false)}
        bodyStyle={{
          paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 0,
        }}
      >
        <Steps size="small" direction="horizontal" current={step} onChange={onStepChange}>
          <Step title="Regras do jogo" key={1} />
          <Step title="Configurações da partida" key={2} />
        </Steps>
        {renderMatchRules()}
        {renderMatchSettings()}
      </Modal>
    );
  }

  function renderMatchConfirmation() {
    const values = form.getFieldsValue();

    const player1Name = typeof values.player1 === 'object' ? values.player1.label : values.player1;
    const player2Name = typeof values.player2 === 'object' ? values.player2.label : values.player2;

    return (
      <Modal
        title="Confirmar criação da partida"
        visible={showMatchConfirmation}
        forceRender
        onOk={() => {
          form.submit();
          setShowMatchConfirmation(false);
        }}
        okText="Confirmar"
        onCancel={() => setShowMatchConfirmation(false)}
        bodyStyle={{
          paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24,
        }}
      >
        <Row>
          <Col>
            <Space>
              <Text strong>Jogador 1:</Text>
              <Text>{player1Name}</Text>
            </Space>
          </Col>
        </Row>
        <Row>
          <Col>
            <Space>
              <Text strong>Jogador 2:</Text>
              <Text>{player2Name}</Text>
            </Space>
          </Col>
        </Row>
        <Row>
          <Col>
            <Space>
              <Text strong>Tipo do último set:</Text>
              <Text>{values.tieBreakType === 'REGULAR' ? 'Regular' : 'Até 10 pontos'}</Text>
            </Space>
          </Col>
        </Row>
        <Row>
          <Col>
            <Space>
              <Text strong>Pontuação:</Text>
              <Text>{values.scoringType === 'BASIC' ? 'Básica' : 'Avançada'}</Text>
            </Space>
          </Col>
        </Row>
        <Row>
          <Col>
            <Space>
              <Text strong>Vantagem:</Text>
              <Text>{values.hasAdvantage ? 'Sim' : 'Não'}</Text>
            </Space>
          </Col>
        </Row>
        <Row>
          <Col>
            <Space>
              <Text strong>Listada:</Text>
              <Text>{values.listed ? 'Sim' : 'Não'}</Text>
            </Space>
          </Col>
        </Row>
        <Row>
          <Col>
            <Space>
              <Text strong>PIN:</Text>
              <Text>{values.pin || 'Sem pin'}</Text>
            </Space>
          </Col>
        </Row>
      </Modal>
    );
  }

  function renderContent() {
    return (
      <div style={{
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
      >
        <PlayerInput name="player1" placeholder="Selecionar jogador 1" form={form} />
        <PlayerInput name="player2" placeholder="Selecionar jogador 2" form={form} />
        <Button
          type="link"
          icon={<SettingOutlined />}
          onClick={onAdvancedSettingsClick}
        >
          Configurações avançadas
        </Button>
      </div>
    );
  }

  function onFormChange(values, allValues) {
    setEnableCreateButton(allValues.player1 && allValues.player2);
  }

  return (
    <Form
      form={form}
      style={{
        display: 'flex', flexDirection: 'column', height: '100%', padding: 16,
      }}
      size="large"
      onFinish={onSubmit}
      onValuesChange={onFormChange}
      initialValues={{
        tieBreakType: 'REGULAR',
        scoringType: 'BASIC',
        hasAdvantage: true,
        listed: true,
        pin: null,
      }}
    >
      {renderTitle()}
      {renderContent()}

      <Row style={{ marginBottom: 48 }} justify="center">
        <Col>
          <Form.Item>
            <Button
              style={{ width: 250 }}
              size="large"
              type="primary"
              onClick={() => setShowMatchConfirmation(true)}
              disabled={!enableCreateButton}
            >
              Criar partida

            </Button>
          </Form.Item>
        </Col>
      </Row>

      {renderAdvancedSettings()}
      {renderMatchConfirmation()}
    </Form>
  );
}

export default CreateMatchPage;
