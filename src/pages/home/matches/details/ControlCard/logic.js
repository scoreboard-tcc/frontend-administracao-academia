import {
  CurrentState, isScoreLess, ScoreValues, TiebreakType,
} from 'utils/tennis';

function checkIfMatchFinished(state, action) {
  const newState = JSON.parse(JSON.stringify(state));
  const anotherPlayer = 1 - action.player;

  if (newState.setsWon[action.player] === 2) {
    newState.matchWinner = action.player;
  } else if (newState.setsWon[action.player] === newState.setsWon[anotherPlayer]
      && newState.settings.tiebreakType === TiebreakType.TEN_POINTS) {
    newState.currentState = CurrentState.TEN_POINTS_TIEBREAK;
    newState.game[action.player] = 0;
    newState.game[anotherPlayer] = 0;
  }

  return newState;
}

export default function computeScore(state, action) {
  let newState = JSON.parse(JSON.stringify(state));
  const anotherPlayer = 1 - action.player;

  if (action.type === 'INCREMENT') {
    if (newState.currentState === CurrentState.GAME) {
      if (newState.game[action.player] === ScoreValues.ZERO) {
        newState.game[action.player] = ScoreValues.FIFTEEN;
      } else if (newState.game[action.player] === ScoreValues.FIFTEEN) {
        newState.game[action.player] = ScoreValues.THIRTY;
      } else if (newState.game[action.player] === ScoreValues.THIRTY) {
        newState.game[action.player] = ScoreValues.FORTY;
      } else if (newState.game[action.player] === ScoreValues.FORTY) {
        if (newState.settings.advantage) {
          if (isScoreLess(newState.game[anotherPlayer], ScoreValues.FORTY)) {
            newState.game[action.player] = ScoreValues.GAME;
          } else if (newState.game[anotherPlayer] === ScoreValues.FORTY) {
            newState.game[action.player] = ScoreValues.ADVANTAGE;
          } else if (newState.game[anotherPlayer] === ScoreValues.ADVANTAGE) {
            newState.game[anotherPlayer] = ScoreValues.FORTY;
          } else {
            throw new Error('Incorrect state');
          }
        } else {
          newState.game[action.player] = ScoreValues.GAME;
        }
      } else if (newState.game[action.player] === ScoreValues.ADVANTAGE) {
        newState.game[action.player] = ScoreValues.GAME;
      } else {
        throw new Error('Incorrect state');
      }

      if (newState.game[action.player] === ScoreValues.GAME) {
        newState.sets[newState.currentSet][action.player] += 1;

        newState.game[action.player] = ScoreValues.ZERO;
        newState.game[anotherPlayer] = ScoreValues.ZERO;

        newState.playerServing = newState.playerServing === 0 ? 1 : 0;

        const playerGamesWon = newState.sets[newState.currentSet][action.player];
        const anotherPlayerGamesWon = newState.sets[newState.currentSet][anotherPlayer];

        if (playerGamesWon >= 6
            && playerGamesWon - anotherPlayerGamesWon >= 2) {
          newState.currentSet += 1;
          newState.setsWon[action.player] += 1;

          newState = checkIfMatchFinished(newState, action);
        } else if (playerGamesWon === 6 && anotherPlayerGamesWon === 6) {
          newState.currentState = CurrentState.SET_TIEBREAK;

          newState.game[action.player] = 0;
          newState.game[anotherPlayer] = 0;
        }
      }
    } else if (newState.currentState === CurrentState.SET_TIEBREAK) {
      newState.game[action.player] += 1;

      if (newState.game[action.player] >= 7
          && newState.game[action.player] - newState.game[anotherPlayer] >= 2) {
        newState.sets[newState.currentSet][action.player] += 1;

        newState.currentSet += 1;
        newState.setsWon[action.player] += 1;

        newState.game[action.player] = ScoreValues.ZERO;
        newState.game[anotherPlayer] = ScoreValues.ZERO;

        newState.currentState = CurrentState.GAME;

        newState = checkIfMatchFinished(newState, action);
      }
    } else if (newState.currentState === CurrentState.TEN_POINTS_TIEBREAK) {
      newState.game[action.player] += 1;

      if (newState.game[action.player] === 10) {
        newState.setsWon[action.player] += 1;

        newState.matchWinner = action.player;
      }
    } else {
      throw new Error('Incorrect state');
    }
  }
  return newState;
}
