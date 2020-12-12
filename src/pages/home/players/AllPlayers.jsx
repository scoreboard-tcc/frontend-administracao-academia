import {
  Button, Col, Form, Input, message, Row, Space, Table,
} from 'antd';
import useAxios from 'hooks/use-axios';
import React, { useCallback, useEffect, useState } from 'react';

const { Search } = Input;

const { Column } = Table;

function AllPlayers({ onCadastrarClick, updateData }) {
  const axios = useAxios();
  const [dataSource, setDataSource] = useState({});
  const [page, setPage] = useState(1);

  const requestDataSource = useCallback(async (search = '') => {
    const response = await axios.get('player', {
      params: {
        onlyFromAcademy: false,
        currentPage: page,
        search,
        perPage: 10,
      },
    });

    setDataSource(response.data);
  }, [axios, page]);

  useEffect(() => {
    requestDataSource();
  }, [updateData]);

  function onSearch(value) {
    requestDataSource(value);
  }

  async function onLink(player) {
    try {
      await axios.put(`player/${player.id}`);
      message.success('O jogador foi vinculado à academia com sucesso.');
    } catch (error) {
      const { response = {} } = error;
      const { data = {} } = response;
      const { message: msg = 'Ocorreu um erro ao vincular o jogador à academia.' } = data;

      message.error(msg);
    } finally {
      requestDataSource();
    }
  }

  function renderActions(player) {
    return (
      <Space>
        <a onClick={() => onLink(player)}>Vincular à academia</a>
      </Space>
    );
  }

  return (
    <>
      <Form>
        <Row>
          <Col span={8}>
            <Form.Item>
              <Search onSearch={onSearch} size="large" placeholder="Pesquisar jogador" />
            </Form.Item>
          </Col>
          <Col flex={1} />
          <Col>
            <Button
              type="primary"
              size="large"
              onClick={onCadastrarClick}
            >
              Cadastrar jogador
            </Button>
          </Col>
        </Row>
      </Form>
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
        <Column title="Ações" key="actions" width={200} render={renderActions} />
      </Table>
    </>
  );
}

export default AllPlayers;
