import {
  Layout, message, Skeleton,
} from 'antd';
import { Content } from 'antd/lib/layout/layout';
import useAxios from 'hooks/use-axios';
import React, {
  useCallback, useEffect, useState,
} from 'react';
import { useHistory, useParams } from 'react-router-dom';
import MatchHeader from './MatchHeader';
import MatchTabs from './MatchTabs';

function MatchDetailsPage() {
  const { id: matchId } = useParams();
  const history = useHistory();
  const axios = useAxios();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestMatch = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`/public/getMatchById/${matchId}`);

      setMatch(data);
    } catch (error) {
      message.error('Ocorreu um erro ao carregar a partida');
      history.replace('/home/matches/');
    } finally {
      setLoading(false);
    }
  }, [matchId, axios, history]);

  useEffect(() => {
    requestMatch();
  }, [requestMatch]);

  if (loading || !match) {
    return <Skeleton />;
  }

  return (
    <Layout style={{ backgroundColor: 'white' }}>
      <MatchHeader match={match} />
      <Content style={{ padding: 8 }}>
        {/* TODO: se não for coordenador e não estiver controlando, não mostrar as abas */}

        <MatchTabs match={match} />
      </Content>
    </Layout>
  );
}

export default MatchDetailsPage;
