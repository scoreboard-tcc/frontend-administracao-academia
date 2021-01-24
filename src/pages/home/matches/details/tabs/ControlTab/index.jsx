import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Col, Row, Tag } from 'antd';
import React, { useMemo } from 'react';
import { getPublishToken } from 'utils/tokens';
import ControlCard from '../../ControlCard';
import TimeLine from '../../TimeLine';

function ControlTab({ match }) {
  const publishToken = useMemo(() => getPublishToken(match), [match]);

  function renderSomeoneIsControlling() {
    if (!publishToken) {
      return (
        <Row style={{ marginBottom: 16 }} justify="center">
          <Col>
            <Tag
              icon={<ExclamationCircleOutlined />}
              color="warning"
              style={{
                height: 48,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Alguem está controlando essa partida
            </Tag>
          </Col>
        </Row>
      );
    }

    return null;
  }

  return (
    <>
      {renderSomeoneIsControlling()}
      <ControlCard match={match} />
      <TimeLine match={match} />
    </>
  );
}

export default ControlTab;
