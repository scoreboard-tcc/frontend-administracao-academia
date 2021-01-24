import { message, Spin, Timeline } from 'antd';
import useAxios from 'hooks/use-axios';
import useBroker from 'hooks/use-broker';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { getBrokerTopic } from 'utils/tokens';

function TimeLine({ match }) {
  const axios = useAxios();
  const broker = useBroker();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const matchTopic = useMemo(() => {
    const topic = getBrokerTopic(match);

    if (!topic) {
      message.error('O usuário não tem permissão para acompanhar a partida.');
      return '';
    }

    return topic;
  }, [match]);

  const requestLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/logs', {
        headers: {
          'x-broker-topic': matchTopic,
        },
        params: {
          limit: 999,
        },
      });

      setLogs(data.docs);
    } catch (error) {
      message.error('Ocorreu um erro ao carregar as mensagens');
    } finally {
      setLoading(false);
    }
  }, [axios, matchTopic]);

  function renderLog(log) {
    return <Timeline.Item key={log.createdAt}>{log.message}</Timeline.Item>;
  }

  useEffect(() => {
    if (!matchTopic) {
      return () => { };
    }

    requestLogs();

    broker.subscribe(`${matchTopic}/Message`);

    broker.on('message', (fullTopic, data) => {
      try {
        setLogs((oldLogs) => [...oldLogs, {
          message: data.toString(),
          createdAt: new Date(),
        }]);
      } catch (error) {
        message.error('Ocorreu um erro ao receber as informações do broker');
      }
    });

    return () => {
      broker.unsubscribe(`${matchTopic}/Message`);
      broker.removeAllListeners();
    };
  }, [requestLogs, broker, matchTopic]);

  return (
    <div style={{
      marginTop: 16,
      paddingLeft: 4,
      paddingTop: 32,
      height: 400,
      overflow: 'auto',
      textAlign: loading ? 'center' : 'left',
    }}
    >
      {loading ? <Spin /> : (
        <Timeline pending="Carregando..." reverse>
          {logs
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map(renderLog)}
        </Timeline>
      ) }

    </div>
  );
}

export default TimeLine;
