import { ControlOutlined, HistoryOutlined, LinkOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import React, { useMemo } from 'react';
import { getPublishToken } from 'utils/tokens';
import ActionsTab from './tabs/ActionsTab';
import ControlTab from './tabs/ControlTab';
import LinksTab from './tabs/LinksTab';

const { TabPane } = Tabs;

function MatchTabs({ match }) {
  const publishToken = useMemo(() => getPublishToken(match), [match]);

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
          isCoordinator
        />
      </TabPane>
      <TabPane
        disabled={!publishToken}
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
      <TabPane
        tab={(
          <span>
            <LinkOutlined />
            Links
          </span>
      )}
        key="links"
      >
        <LinksTab
          match={match}
        />
      </TabPane>
    </Tabs>
  );
}

export default MatchTabs;
