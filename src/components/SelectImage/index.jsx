import { PlusOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

function SelectImage({ name, initialImageUrl, onSelectFile }) {
  const [fileList, setFileList] = useState(initialImageUrl ? [{
    uid: '-1',
    name: 'logo.png',
    status: 'done',
    url: initialImageUrl,
  }] : []);

  function beforeUpload() {
    return false;
  }

  function handleChange({ fileList: files }) {
    setFileList(files);

    if (!files.length) return onSelectFile(null);

    return onSelectFile(files[0].originFileObj);
  }

  return (
    <Upload
      name={name}
      beforeUpload={beforeUpload}
      listType="picture-card"
      fileList={fileList}
      showUploadList={{ showPreviewIcon: false }}
      onChange={handleChange}
      accept=".png,.jpg,.jpeg"
    >
      {fileList.length ? null : (
        <div>
          <PlusOutlined />
        </div>
      )}
    </Upload>
  );
}

SelectImage.propTypes = {
  name: PropTypes.string.isRequired,
  initialImageUrl: PropTypes.string,
  onSelectFile: PropTypes.func.isRequired,
};

SelectImage.defaultProps = {
  initialImageUrl: '',
};

export default SelectImage;
