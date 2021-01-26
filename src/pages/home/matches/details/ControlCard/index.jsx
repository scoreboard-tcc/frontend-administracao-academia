import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card, Col, message, Row, Typography,
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import MatchScore from 'components/MatchScore';
import useBroker from 'hooks/use-broker';
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import {
  CurrentState, scoreStringToValue, ScoreType, scoreValueToString,
} from 'utils/tennis';
import { getBrokerTopic, getPublishToken } from 'utils/tokens';
import computeScore from './logic';

const { Text } = Typography;

function ScoreModal({
  visible, setVisible, onScore, player,
}) {
  return (
    <Modal
      title="Escolha uma opção"
      visible={visible}
      forceRender
      footer={null}
      onCancel={() => setVisible(false)}
      bodyStyle={{
        padding: 24, paddingTop: 48,
      }}
    >
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Button
            block
            size="large"
            onClick={() => {
              setVisible(false);
              onScore(player, 'SCORE');
            }}
          >
            Ponto comum
          </Button>
        </Col>
      </Row>

      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Button
            block
            size="large"
            onClick={() => {
              setVisible(false);
              onScore(player, 'ACE');
            }}
          >
            Ace
          </Button>
        </Col>
      </Row>

      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Button
            block
            size="large"
            onClick={() => {
              setVisible(false);
              onScore(player, 'DOUBLE_FAULT');
            }}
          >
            Dupla falta
          </Button>
        </Col>
      </Row>

      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Button
            block
            size="large"
            onClick={() => {
              setVisible(false);
              onScore(player, 'WINNER');
            }}
          >
            Winner
          </Button>
        </Col>
      </Row>

      <Row justify="center">
        <Col>
          <Button size="large" type="link" onClick={() => setVisible(false)}>Cancelar</Button>
        </Col>
      </Row>
    </Modal>
  );
}

function ControlCard({ match }) {
  const broker = useBroker();
  const history = useHistory();

  const matchData = useRef({});
  const [hasWinner, setHasWinner] = useState(false);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const publishToken = useMemo(() => getPublishToken(match), [match]);

  const matchTopic = useMemo(() => {
    const topic = getBrokerTopic(match);

    if (!topic) {
      message.error('O usuário não tem permissão para acompanhar a partida.');
      return '';
    }

    return topic;
  }, [match]);

  const publishScore = useCallback((score, player, scoreType) => {
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
      scoreType,
    ];

    broker.publish(
      `${matchTopic}/Score`,
      JSON.stringify({ publishToken, payload: topicArray.join(';') }),
      { retain: true, qos: 1 },
    );
  }, [broker, matchTopic, publishToken]);

  const onScore = useCallback((player, scoreType = 'SCORE') => {
    const data = matchData.current;

    const isOnTiebreak = data.Current_State === CurrentState.SET_TIEBREAK
      || data.Current_State === CurrentState.TEN_POINTS_TIEBREAK;

    const state = {
      game: [
        scoreStringToValue(data.Score_A, isOnTiebreak),
        scoreStringToValue(data.Score_B, isOnTiebreak),
      ],
      sets: [
        [parseInt(data.Set1_A, 10), parseInt(data.Set1_B, 10)],
        [parseInt(data.Set2_A, 10), parseInt(data.Set2_B, 10)],
        [parseInt(data.Set3_A, 10), parseInt(data.Set3_B, 10)],
      ],
      currentSet: parseInt(data.Current_Set, 10),
      currentState: data.Current_State,
      matchWinner: data.Match_Winner === 'null' ? null : parseInt(data.Match_Winner, 10),
      playerServing: parseInt(data.Player_Serving, 10),
      setsWon: [
        parseInt(data.SetsWon_A, 10),
        parseInt(data.SetsWon_B, 10),
      ],
      settings: {
        tiebreakType: match.tieBreakType,
        advantage: match.hasAdvantage,
      },
    };

    const newScore = computeScore(JSON.parse(JSON.stringify(state)), { type: 'INCREMENT', player });

    publishScore(newScore, player, scoreType);
  }, [match, publishScore]);

  function onScoreButtonClick(player) {
    if (match.scoringType === ScoreType.ADVANCED) {
      setSelectedPlayer(player);
      setScoreModalVisible(true);
      return;
    }

    onScore(player);
  }

  function renderScoreButton(playerName, player) {
    return (
      <Button
        onClick={() => onScoreButtonClick(player)}
        disabled={hasWinner}
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

        if (topic === 'Match_Winner' && data.toString() !== 'null') {
          setHasWinner(true);
        }

        matchData.current[topic] = data.toString();
      } catch (error) {
        message.error('Ocorreu um erro ao receber as informações do broker');
      }
    });

    return () => {
      broker.unsubscribe(`${matchTopic}/Score`);
      broker.removeAllListeners();
    };
  }, [broker, matchTopic]);

  return (
    <Card bodyStyle={{ paddingTop: 0 }} actions={renderActions()}>
      <ScoreModal
        match={match}
        player={selectedPlayer}
        visible={scoreModalVisible}
        setVisible={setScoreModalVisible}
        onScore={onScore}
      />
      <MatchScore
        onControlChanged={onControlChanged}
        onMatchFinished={onMatchFinished}
        match={match}
      />
    </Card>
  );
}

export default ControlCard;
