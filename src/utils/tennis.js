export const ScoreValues = {
  ZERO: 'ZERO',
  FIFTEEN: 'FIFTEEN',
  THIRTY: 'THIRTY',
  FORTY: 'FORTY',
  ADVANTAGE: 'ADVANTAGE',
  GAME: 'GAME',
};

export const TiebreakType = {
  REGULAR: 'REGULAR',
  TEN_POINTS: 'TEN_POINTS',
};

export const ScoreType = {
  BASIC: 'BASIC',
  ADVANCED: 'ADVANCED',
};

export const CurrentState = {
  GAME: 'GAME',
  SET_TIEBREAK: 'SET_TIEBREAK',
  TEN_POINTS_TIEBREAK: 'TEN_POINTS_TIEBREAK',
};

export function isScoreLess(score1, score2) {
  const order = [ScoreValues.ZERO,
    ScoreValues.FIFTEEN,
    ScoreValues.THIRTY,
    ScoreValues.FORTY,
    ScoreValues.ADVANTAGE];

  if (order.indexOf(score1) === -1 || order.indexOf(score2) === -1) return false;

  return order.indexOf(score1) < order.indexOf(score2);
}

export function scoreStringToValue(string, isOnTieBreak) {
  switch (string) {
    case '0':
      return isOnTieBreak ? 0 : ScoreValues.ZERO;
    case '15':
      return ScoreValues.FIFTEEN;
    case '30':
      return ScoreValues.THIRTY;
    case '40':
      return ScoreValues.FORTY;
    case 'ADV':
      return ScoreValues.ADVANTAGE;
    case 'GAME':
      return ScoreValues.GAME;
    default:
      return parseInt(string, 10);
  }
}

export function scoreValueToString(value) {
  switch (value) {
    case ScoreValues.ZERO:
      return '0';
    case ScoreValues.FIFTEEN:
      return '15';
    case ScoreValues.THIRTY:
      return '30';
    case ScoreValues.FORTY:
      return '40';
    case ScoreValues.ADVANTAGE:
      return 'ADV';
    case ScoreValues.GAME:
      return 'GAME';
    default:
      return value.toString();
  }
}
