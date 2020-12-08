import {
  Button, Col, Form, Input, Layout, message, Popconfirm, Row, Space, Table, Modal,
} from 'antd';
import useAxios from 'hooks/use-axios';
import React, { useCallback, useEffect, useState } from 'react';

const { Column } = Table;
const { Content } = Layout;
const { Search } = Input;

function CoordinatorsPage() {
  const axios = useAxios();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState({});
  const [editingCoordinator, setEditingCoordinator] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);

  const requestDataSource = useCallback(async (search = '') => {
    const response = await axios.get('/coordinator/coordination', {
      params: {
        currentPage: page,
        search,
        perPage: 10,
      },
    });

    setDataSource(response.data);
  }, [axios, page]);

  useEffect(() => {
    requestDataSource();
  }, [requestDataSource]);

  function onSearch(value) {
    requestDataSource(value);
  }

  function openCreateOrEditCoordinatorModal(coordinator) {
    setModalVisible(true);

    if (coordinator) {
      setEditingCoordinator(coordinator);
      form.setFieldsValue(coordinator);
    }
  }

  async function onRemove(coordinator) {
    try {
      await axios.delete(`coordinator/coordination/${coordinator.id}`);
      message.success('O coordenador foi excluido com sucesso.');
    } catch (error) {
      message.error('Ocorreu um erro ao excluir o coordenador.');
    } finally {
      requestDataSource();
    }
  }

  function handleCancel() {
    setModalVisible(false);
    setEditingCoordinator(null);

    form.resetFields();
  }

  async function createCoordinator(values) {
    try {
      await axios.post('coordinator/coordination', values);
      message.success('O coordenador foi criado com sucesso.');

      handleCancel();
    } catch (error) {
      const { response = {} } = error;
      const { data = {} } = response;
      const { message: msg = 'Ocorreu um erro ao criar o coordenador.' } = data;

      message.error(msg);
    } finally {
      requestDataSource();
    }
  }

  async function updateCoordinator(values) {
    try {
      await axios.put(`coordinator/coordination/${editingCoordinator.id}`, values);
      message.success('O coordenador foi atualizado com sucesso.');

      handleCancel();
    } catch (error) {
      const { response = {} } = error;
      const { data = {} } = response;
      const { message: msg = 'Ocorreu um erro ao atualizar o coordenador.' } = data;

      message.error(msg);
    } finally {
      requestDataSource();
    }
  }

  function handleOk() {
    form
      .validateFields()
      .then((values) => {
        if (editingCoordinator) { return updateCoordinator(values); }
        return createCoordinator(values);
      });
  }

  function renderModal() {
    return (
      <Modal
        visible={modalVisible}
        title={editingCoordinator ? 'Editar coordenador' : 'Criar coordenador'}
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
              {!editingCoordinator && modalVisible && (
                <Form.Item
                  name="password"
                  label="Senha"
                  rules={[{ required: true, message: 'Por favor digite uma senha' }, { min: 6, message: 'A senha deve conter no mínimo 6 caracteres' }]}
                >
                  <Input.Password />
                </Form.Item>
              )}

            </Form>
          </Col>
        </Row>
      </Modal>
    );
  }

  function renderActions(coordinator) {
    return (
      <Space>
        <a onClick={() => openCreateOrEditCoordinatorModal(coordinator)}>Editar</a>
        <Popconfirm title="Tem certeza?" onConfirm={() => onRemove(coordinator)}>
          <a>Excluir</a>
        </Popconfirm>
      </Space>
    );
  }

  return (
    <Layout style={{ backgroundColor: 'white' }}>
      <Form>
        <Row>
          <Col span={8}>
            <Form.Item>
              <Search onSearch={onSearch} size="large" placeholder="Pesquisar coordenador" />
            </Form.Item>
          </Col>
          <Col flex="auto" />
          <Col>
            <Form.Item>
              <Button
                type="primary"
                size="large"
                onClick={() => openCreateOrEditCoordinatorModal()}
              >
                Cadastrar coordenador
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Content>
        <Table
          bordered
          loading={!dataSource}
          rowKey="id"
          dataSource={dataSource ? dataSource.data : []}
          rowClassName="cursor"
          pagination={{
            current: page,
            onChange: (x) => setPage(x),
            pageSize: 10,
            total: dataSource && dataSource.pagination ? dataSource.pagination.total : 0,
          }}
        >
          <Column title="Nome" dataIndex="name" />
          <Column title="E-mail" dataIndex="email" />
          <Column title="Ações" key="actions" render={renderActions} />
        </Table>
        {renderModal()}
      </Content>
    </Layout>
  );
}

export default CoordinatorsPage;
