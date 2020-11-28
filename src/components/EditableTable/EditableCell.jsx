/* eslint-disable react/jsx-props-no-spreading */
import { Form, Input } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';

function EditableCell({
  children, dataIndex, isEditing, rules, index, firstInputRef, ...restProps
}) {

  const content = isEditing
    ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={rules}
      >
        <Input ref={index === 0 ? firstInputRef : null} />
      </Form.Item>
    ) : children;

  return (
    <td {...restProps}>
      {content}
    </td>
  );
}

EditableCell.propTypes = {
  children: PropTypes.node,
  dataIndex: PropTypes.string,
  isEditing: PropTypes.bool,
  rules: PropTypes.array,
  index: PropTypes.number,
  firstInputRef: PropTypes.any,
};

EditableCell.defaultProps = {
  dataIndex: '',
  children: null,
  firstInputRef: null,
};

export default EditableCell;
