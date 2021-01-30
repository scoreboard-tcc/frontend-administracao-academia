import { ControlOutlined, HistoryOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import React, { useState } from 'react';
import ActionsTab from './tabs/ActionsTab';
import ControlTab from './tabs/ControlTab';

const { TabPane } = Tabs;

function MatchTabs({ match }) {
  return (
    <Tabs destroyInactiveTabPane>
      <TabPane
        tab={(
          <span>
            <ControlOutlined />
            Controle
          </span>
      )}
        key="control"
      >
        <ControlTab
          match={match}
        />
      </TabPane>
      <TabPane
        tab={(
          <span>
            <HistoryOutlined />
            Ações
          </span>
      )}
        key="actions"
      >
        <ActionsTab
          match={match}
        />
      </TabPane>
    </Tabs>
  );
}

export default MatchTabs;
