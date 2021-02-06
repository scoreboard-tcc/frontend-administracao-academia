import { message, Spin } from 'antd';
import useAxios from 'hooks/use-axios';
import React, { useCallback, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { putControlData, putSubscribeData } from 'utils/tokens';

function TokenRedirectPage() {
  const axios = useAxios();
  const { search } = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(search);

  const refreshToken = query.get('refresh_token');

  const requestTokens = useCallback(async () => {
    try {
      const { data } = await axios.post('/public/changeControl', {
        refreshToken,
      });

      putControlData(data.matchId, {
        publishToken: data.publishToken,
        refreshToken: data.refreshToken,
        expirationDate: data.expirationDate,
        controllerSequence: data.controllerSequence,
      });

      putSubscribeData(data.matchId, {
        brokerTopic: data.brokerTopic,
        expirationDate: data.expirationDate,
      });

      history.replace(`/match/${data.matchId}`);
    } catch (error) {
      message.error('Ocorreu um erro ao obter o controle da partida.');
    }
  }, [axios, refreshToken, history]);

  useEffect(() => {
    requestTokens();
  }, [requestTokens]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    }}
    >
      <Spin size="large" />
    </div>
  );
}

export default TokenRedirectPage;
