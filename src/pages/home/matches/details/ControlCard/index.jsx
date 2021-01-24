import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card, Col, message, Row, Tag, Typography,
} from 'antd';
import MatchScore from 'components/MatchScore';
import useBroker from 'hooks/use-broker';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import { CurrentState, scoreStringToValue, scoreValueToString } from 'utils/tennis';
import { getBrokerTopic, getPublishToken } from 'utils/tokens';
import computeScore from './logic';

const { Text } = Typography;

function ControlCard({ match }) {
  const broker = useBroker();
  const history = useHistory();

  const [matchData, setMatchData] = useState({});

  const publishToken = useMemo(() => getPublishToken(match), [match]);

  const matchTopic = useMemo(() => {
    const topic = getBrokerTopic(match);

    if (!topic) {
      message.error('O usuário não tem permissão para acompanhar a partida.');
      return '';
    }

    return topic;
  }, [match]);

  function publishScore(score, player) {
    const topicArray = [
      score.sets[0][0].toString(),
      score.sets[0][1].toString(),
      score.sets[1][0].toString(),
      score.sets[1][1].toString(),
      score.sets[2][0].toString(),
      score.sets[2][1].toString(),
      scoreValueToString(score.game[0]).toString(),
      scoreValueToString(score.game[1]).toString(),
      score.currentSet.toString(),
      score.setsWon[0].toString(),
      score.setsWon[1].toString(),
      score.playerServing.toString(),
      score.matchWinner !== null ? score.matchWinner.toString() : 'null',
      score.currentState.toString(),
      player.toString(),
      'SCORE',
    ];

    broker.publish(
      `${matchTopic}/Score`,
      JSON.stringify({ publishToken, payload: topicArray.join(';') }),
      { retain: true, qos: 1 },
    );
  }

  function onScore(player) {
    const isOnTiebreak = matchData.Current_State === CurrentState.SET_TIEBREAK
            || matchData.Current_State === CurrentState.TEN_POINTS_TIEBREAK;

    const state = {
      game: [
        scoreStringToValue(matchData.Score_A, isOnTiebreak),
        scoreStringToValue(matchData.Score_B, isOnTiebreak),
      ],
      sets: [
        [parseInt(matchData.Set1_A, 10), parseInt(matchData.Set1_B, 10)],
        [parseInt(matchData.Set2_A, 10), parseInt(matchData.Set2_B, 10)],
        [parseInt(matchData.Set3_A, 10), parseInt(matchData.Set3_B, 10)],
      ],
      currentSet: parseInt(matchData.Current_Set, 10),
      currentState: matchData.Current_State,
      matchWinner: matchData.Match_Winner === 'null' ? null : parseInt(matchData.Match_Winner, 10),
      playerServing: parseInt(matchData.Player_Serving, 10),
      setsWon: [
        parseInt(matchData.SetsWon_A, 10),
        parseInt(matchData.SetsWon_B, 10),
      ],
      settings: {
        tiebreakType: match.tieBreakType,
        advantage: match.hasAdvantage,
      },
    };

    const newScore = computeScore(JSON.parse(JSON.stringify(state)), { type: 'INCREMENT', player });

    publishScore(newScore, player);
  }

  function renderScoreButton(playerName, player) {
    const enableButton = matchData.Match_Winner && matchData.Match_Winner === 'null';

    return (
      <Button
        onClick={() => onScore(player)}
        disabled={!enableButton}
        size="large"
        type="text"
        icon={(
          <PlusOutlined
            style={{ fontSize: 18, marginLeft: 8 }}
          />
                )}
      >
        <Text>{playerName}</Text>
      </Button>
    );
  }

  function renderActions() {
    if (publishToken) {
      return [
        renderScoreButton(match.player1Name, 0),
        renderScoreButton(match.player2Name, 1),
      ];
    }

    return [];
  }

  const onControlChanged = useCallback(() => {
    alert('control changed');
  }, []);

  const onMatchFinished = useCallback(() => {
    message.info('A partida terminou! Em alguns instantes você será redirecionado para a lista de placares.');

    setTimeout(() => {
      history.replace('/home/matches');
    }, 2000);
  }, [history]);

  useEffect(() => {
    if (!matchTopic) {
      return () => { };
    }

    broker.subscribe(`${matchTopic}/+`);

    broker.on('message', (fullTopic, data) => {
      try {
        const topic = fullTopic.split('/')[1];

        setMatchData((prevState) => ({ ...prevState, [topic]: data.toString() }));
      } catch (error) {
        message.error('Ocorreu um erro ao receber as informações do broker');
      }
    });

    return () => {
      broker.unsubscribe(`${matchTopic}/+`);
      broker.removeAllListeners();
    };
  }, [broker, matchTopic]);

  return (
    <Card bodyStyle={{ paddingTop: 0 }} actions={renderActions()}>
      <MatchScore
        onControlChanged={onControlChanged}
        onMatchFinished={onMatchFinished}
        match={match}
      />
    </Card>
  );
}

export default ControlCard;
