import {
  Button, Col, Form, Popconfirm, Row, Space, Table,
} from 'antd';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import EditableCell from './EditableCell';

const { useForm } = Form;

function EditableTable({
  columns, keyColumn = 'key', initialDataSource, onDataSourceChange,
}) {
  const [dataSource, setDataSource] = useState(initialDataSource);
  const [editingRowForm] = useForm();
  const editingRowFirstInputRef = useRef();
  const [editingKey, setEditingKey] = useState(null);

  function addRow() {
    if (editingKey !== null) {
      if (editingRowFirstInputRef.current) {
        editingRowFirstInputRef.current.focus();
      }

      return;
    }

    setDataSource([...dataSource, {
      [keyColumn]: '',
      key: '',
    }]);

    setEditingKey('');
  }

  async function onSave(item) {
    try {
      const row = await editingRowForm.validateFields();

      const newData = [...dataSource];
      const index = newData.findIndex((el) => el[keyColumn] === item[keyColumn]);

      if (index > -1) {
        newData[index] = { ...newData[index], ...row };
      } else {
        newData.push(row);
      }

      setDataSource(newData);
      onDataSourceChange(newData);

      setEditingKey(null);

      editingRowForm.resetFields();
    } catch (error) {
      console.error(error);
    }
  }

  function onCancel() {
    if (editingKey === '') {
      const newData = [...dataSource];
      const index = newData.findIndex((item) => item[keyColumn] === '');

      newData.splice(index, 1);

      setDataSource(newData);
    }

    setEditingKey(null);

    editingRowForm.resetFields();
  }

  function onEdit(item) {
    setEditingKey(item[keyColumn]);

    editingRowForm.setFieldsValue(item);
  }

  function onRemove(item) {
    const newData = [...dataSource];
    const index = newData.findIndex((el) => el[keyColumn] === item[keyColumn]);

    newData.splice(index, 1);

    setDataSource(newData);
    onDataSourceChange(newData);
  }

  function renderActions(text, record, index) {
    const isEditing = editingKey !== null;

    function renderEdit() {
      if (isEditing) {
        return (
          <Popconfirm title="Deseja descartar a linha atual?" onConfirm={() => onEdit(record)}>
            <a disabled={isEditing}>Editar</a>
          </Popconfirm>
        );
      }

      return <a disabled={isEditing} onClick={() => onEdit(record)}>Editar</a>;
    }

    const content = record[keyColumn] === editingKey ? (
      <>
        <a onClick={() => onSave(record)}>Salvar</a>
        <Popconfirm title="Tem certeza?" onConfirm={onCancel}>
          <a>Cancelar</a>
        </Popconfirm>
      </>
    ) : (
      <>
        {renderEdit()}
        <Popconfirm title="Tem certeza?" onConfirm={() => onRemove(record)}>
          <a disabled={isEditing}>Remover</a>
        </Popconfirm>
      </>
    );

    return (
      <Space>
        {content}
      </Space>
    );
  }

  function getColumns() {
    return [...columns.map((column, index) => ({
      ...column,
      onCell: (item) => ({
        item,
        dataIndex: column.dataIndex,
        rules: column.rules || [],
        isEditing: item[keyColumn] === editingKey,
        index,
        firstInputRef: editingRowFirstInputRef,
      }),
    })), {
      title: 'Ações',
      dataIndex: 'actions',
      render: renderActions,
    }];
  }

  return (
    <>
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Button onClick={addRow}>Adicionar placar</Button>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form form={editingRowForm} component={false}>
            <Table
              rowKey={keyColumn}
              bordered
              dataSource={dataSource}
              pagination={false}
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              columns={getColumns()}
            />
          </Form>
        </Col>
      </Row>
    </>
  );
}

EditableTable.propTypes = {
  columns: PropTypes.array.isRequired,
  initialDataSource: PropTypes.array.isRequired,
  onDataSourceChange: PropTypes.func.isRequired,
};

EditableTable.defaultProps = {
};

export default EditableTable;
