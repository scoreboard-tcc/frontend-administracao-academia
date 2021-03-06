import {
  Layout, message, Result, Skeleton,
} from 'antd';
import { Content } from 'antd/lib/layout/layout';
import useAxios from 'hooks/use-axios';
import useBroker from 'hooks/use-broker';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import {
  getBrokerTopic, getControlData, getPublishToken, putSubscribeData, removeControlData,
} from 'utils/tokens';
import MatchHeader from './MatchHeader';
import MatchTabs from './MatchTabs';
import ControlTab from './tabs/ControlTab';

function MatchDetailsPage({ isCoordinator = false }) {
  const broker = useBroker();

  const { id: matchId } = useParams();
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const pin = query.get('pin') || null;

  const history = useHistory();
  const axios = useAxios();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wrongPin, setWrongPin] = useState(false);

  const matchTopic = useMemo(() => {
    if (!match) {
      return '';
    }

    const topic = getBrokerTopic(match);

    if (!topic) {
      return '';
    }

    return topic;
  }, [match]);

  const requestMatch = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`/public/getMatchById/${matchId}`);

      setMatch(data);
    } catch (error) {
      message.error('Ocorreu um erro ao carregar a partida');
      history.replace('/home/matches');
    } finally {
      setLoading(false);
    }
  }, [matchId, axios, history]);

  function isControllingMatch() {
    return getPublishToken(match);
  }

  const checkPin = useCallback(async () => {
    try {
      const { data } = await axios.post('/public/checkPin', {
        matchId,
        pin,
      });

      putSubscribeData(matchId, {
        brokerTopic: data.brokerTopic,
      });

      requestMatch();
    } catch (ex) {
      setWrongPin(true);
    }
  }, [axios, matchId, requestMatch, pin]);

  const checkControllerSequence = useCallback(async (currentControllerSequence) => {
    const controlData = getControlData(match.id);

    if (controlData && controlData.controllerSequence !== currentControllerSequence) {
      removeControlData(match.id);

      await message.warning('Outra pessoa está controlando esta partida.', 1);
      window.location.reload();
    }
  }, [match]);

  useEffect(() => {
    if (!pin) {
      requestMatch();
    } else {
      checkPin(pin);
    }
  }, [requestMatch, checkPin, pin]);

  useEffect(() => {
    if (!match || !matchTopic) {
      return () => {};
    }

    broker.subscribe(`${matchTopic}/Controller_Sequence`, { qos: 1 });

    broker.on('message', (fullTopic, data) => {
      try {
        const topic = fullTopic.split('/')[1];

        if (topic === 'Controller_Sequence') {
          checkControllerSequence(Number(data.toString()));
        }
      } catch (error) {
        message.error('Ocorreu um erro ao receber as informações do broker');
      }
    });

    return () => {
      broker.unsubscribe(`${matchTopic}/Controller_Sequence`);
      broker.removeAllListeners();
    };
  }, [broker, matchTopic, match, checkControllerSequence]);

  if (wrongPin) {
    return (
      <Result title="PIN incorreto" subTitle="Verifique se o link está correto" status="error" />
    );
  }

  if (loading || !match) {
    return <Skeleton />;
  }

  return (
    <Layout style={{ backgroundColor: 'white' }}>
      <MatchHeader match={match} isCoordinator={isCoordinator} />
      <Content style={{ padding: 8 }}>
        {isCoordinator || isControllingMatch()
          ? <MatchTabs match={match} />
          : (
            <ControlTab
              match={match}
              isCoordinator={isCoordinator}
            />
          )}
      </Content>
    </Layout>
  );
}

export default MatchDetailsPage;
