import { ControlOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import React from 'react';
import ControlTab from './tabs/ControlTab';

const { TabPane } = Tabs;

function MatchTabs({ match }) {
  return (
    <Tabs>
      <TabPane
        tab={(
          <span>
            <ControlOutlined />
            Controle
          </span>
      )}
        key="control"
      >
        <ControlTab match={match} />
      </TabPane>
    </Tabs>
  );
}

export default MatchTabs;
