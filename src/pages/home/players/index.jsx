import {
  Tabs, Layout, Row, Col, Button, Form, Modal, Input, message,
} from 'antd';
import useAxios from 'hooks/use-axios';
import React, { useState } from 'react';
import AcademyPlayers from './AcademyPlayers';
import AllPlayers from './AllPlayers';

const { Content } = Layout;
const { TabPane } = Tabs;

function PlayersPage() {
  const [form] = Form.useForm();
  const axios = useAxios();

  const [modalVisible, setModalVisible] = useState(false);
  const [updateData, setUpdateData] = useState(false);

  function handleCancel() {
    setModalVisible(false);

    form.resetFields();
  }

  function onCadastrarClick() {
    setModalVisible(true);
  }

  async function createPlayer(values) {
    try {
      await axios.post('player', values);
      message.success('O jogador foi criado com sucesso.');

      handleCancel();
    } catch (error) {
      const { response = {} } = error;
      const { data = {} } = response;
      const { message: msg = 'Ocorreu um erro ao criar o jogador.' } = data;

      message.error(msg);
    } finally {
      setUpdateData((value) => !value);
    }
  }

  function handleOk() {
    form
      .validateFields()
      .then((values) => createPlayer(values));
  }

  function renderModal() {
    return (
      <Modal
        visible={modalVisible}
        title="Cadastrar jogador"
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Row>
          <Col span={16}>
            <Form size="large" layout="vertical" form={form}>
              <Form.Item
                name="name"
                label="Nome"
                rules={[{ required: true, message: 'Por favor digite um nome' }]}
              >
                <Input placeholder="João" />
              </Form.Item>
              <Form.Item
                name="email"
                label="E-mail"
                rules={[{ required: true, message: 'Por favor digite um e-mail' }, { type: 'email', message: 'Digite um e-mail válido' }]}
              >
                <Input
                  placeholder="joao@silva.com"
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    );
  }

  return (
    <Layout style={{ backgroundColor: 'white' }}>
      <Content>

        <Tabs defaultActiveKey="1" destroyInactiveTabPane>
          <TabPane tab="Jogadores vinculados à academia" key="1">
            <AcademyPlayers onCadastrarClick={onCadastrarClick} updateData={updateData} />
          </TabPane>
          <TabPane tab="Todos os jogadores" key="2">
            <AllPlayers onCadastrarClick={onCadastrarClick} updateData={updateData} />
          </TabPane>
        </Tabs>
        {renderModal()}

      </Content>
    </Layout>
  );
}

export default PlayersPage;
