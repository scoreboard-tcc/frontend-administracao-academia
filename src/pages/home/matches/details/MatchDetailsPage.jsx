import {
  Layout, message, Result, Skeleton,
} from 'antd';
import { Content } from 'antd/lib/layout/layout';
import useAxios from 'hooks/use-axios';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { getPublishToken, putSubscribeData } from 'utils/tokens';
import MatchHeader from './MatchHeader';
import MatchTabs from './MatchTabs';
import ControlTab from './tabs/ControlTab';

function MatchDetailsPage({ isCoordinator = false }) {
  const { id: matchId } = useParams();
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const pin = query.get('pin') || null;

  const history = useHistory();
  const axios = useAxios();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wrongPin, setWrongPin] = useState(false);

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
        expirationDate: data.expiration,
      });

      requestMatch();
    } catch (ex) {
      setWrongPin(true);
    }
  }, [axios, matchId, requestMatch, pin]);

  useEffect(() => {
    if (!pin) {
      requestMatch();
    } else {
      checkPin(pin);
    }
  }, [requestMatch, checkPin, pin]);

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
