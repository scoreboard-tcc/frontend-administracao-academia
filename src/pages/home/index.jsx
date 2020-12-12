import {
  DashboardOutlined, InsertRowBelowOutlined, MenuOutlined, TeamOutlined, UsergroupAddOutlined,
} from '@ant-design/icons';
import {
  Avatar, Button, Col, Dropdown, Layout, Menu, Row, Skeleton, Typography,
} from 'antd';
import ScoreboardIcon from 'assets/icons/scoreboard.png';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link, Route, Switch, useHistory, useLocation, useRouteMatch,
} from 'react-router-dom';
import { setAuth } from 'store/actions/auth';
import getAuthenticationToken from 'utils/token';
import DashboardPage from '../dashboard';
import CoordinatorsPage from './coordinators';
import PlayersPage from './players';

const { Content, Sider } = Layout;
const { Text } = Typography;

function HomePage() {
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const location = useLocation();
  const { academy } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  function logOut() {
    localStorage.clear();
    history.replace('/');
  }

  const menu = (
    <Menu>
      <Menu.Item onClick={() => logOut()}>
        Sair
      </Menu.Item>
    </Menu>
  );

  function renderMenu() {
    return (
      <>
        <Row>
          <Col style={{ padding: 12, flex: 1 }}>
            <Row align="middle">
              <Col span={6}>
                <Avatar src={ScoreboardIcon} shape="square" size={36} />
              </Col>
              <Col span={14}>
                <Text style={{ fontWeight: 500, color: 'white' }}>{academy.name}</Text>
                <br />
                <Text type="secondary" style={{ color: 'white', fontSize: '0.8em' }}>
                  Painel administrativo
                </Text>
              </Col>
              <Col span={4}>
                <Dropdown overlay={menu} trigger={['click']}>
                  <Button type="text" style={{ color: 'white' }} icon={<MenuOutlined />} />
                </Dropdown>
              </Col>
            </Row>
          </Col>
        </Row>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[location.pathname.split('/').slice(-1).pop()]}>
          <Menu.Item key="home" icon={<DashboardOutlined />}>
            <Link to={url}>
              Dashboard
            </Link>
          </Menu.Item>
          <Menu.Item key="scoreboards" icon={<InsertRowBelowOutlined />}>
            <Link to="/">
              Placares
            </Link>
          </Menu.Item>
          <Menu.Item key="players" icon={<TeamOutlined />}>
            <Link to={`${url}/players`}>
              Jogadores
            </Link>
          </Menu.Item>
          <Menu.Item key="coordinators" icon={<UsergroupAddOutlined />}>
            <Link to={`${url}/coordinators`}>
              Coordenadores
            </Link>
          </Menu.Item>
        </Menu>
      </>
    );
  }

  function setupRoutes() {
    return (
      <Switch>
        <Route exact path={`${path}`}>
          <DashboardPage />
        </Route>
        <Route exact path={`${path}/coordinators`}>
          <CoordinatorsPage />
        </Route>
        <Route exact path={`${path}/players`}>
          <PlayersPage />
        </Route>
      </Switch>
    );
  }

  function renderContent() {
    return (
      <>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          width={230}
        >
          {renderMenu()}
        </Sider>
        <Layout>
          <Content style={{ margin: 16, padding: 16, backgroundColor: 'white' }}>
            {setupRoutes()}
          </Content>
        </Layout>
      </>
    );
  }

  useEffect(() => {
    const token = getAuthenticationToken();

    if (token) {
      dispatch(setAuth(token));
    } else {
      localStorage.clear();
      history.replace('/auth');
    }
  }, [history, dispatch]);

  return (
    <Layout style={{ height: '100vh' }}>
      {academy ? renderContent() : <Skeleton />}
    </Layout>
  );
}

export default HomePage;