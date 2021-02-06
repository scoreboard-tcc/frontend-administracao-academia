import { isAfter, parseISO } from 'date-fns';

export function putSubscribeData(matchId, {
  brokerTopic,
  expirationDate,
}) {
  localStorage.setItem(`match-token.subscribe-${matchId}`, JSON.stringify({
    brokerTopic,
    expirationDate,
  }));
}

export function clearExpiredTokens() {
  const invalidKeys = Object
    .entries(localStorage)
    .filter(([key]) => key.startsWith('match-token'))
    .filter(([key]) => {
      const matchData = localStorage.getItem(key);

      try {
        const parsedData = JSON.parse(matchData);

        return isAfter(new Date(), parseISO(parsedData.expirationDate));
      } catch (error) {
        return true;
      }
    });

  invalidKeys.forEach(([key]) => localStorage.removeItem(key));
}

export function putControlData(matchId, {
  publishToken,
  refreshToken,
  expirationDate,
  controllerSequence,
}) {
  localStorage.setItem(`match-token.control-${matchId}`, JSON.stringify({
    publishToken,
    refreshToken,
    expirationDate,
    controllerSequence,
  }));
}

export function getControlData(matchId) {
  const controlData = localStorage.getItem(`match-token.control-${matchId}`);

  try {
    return JSON.parse(controlData);
  } catch (error) {
    return null;
  }
}

export function removeControlData(matchId) {
  localStorage.removeItem(`match-token.control-${matchId}`);
}

export function removeSubscribeData(match) {
  localStorage.removeItem(`match-token.subscribe-${match.id}`);
}

export function getBrokerTopic(match) {
  if (match.brokerTopic) {
    return match.brokerTopic;
  }

  const subscribeData = localStorage.getItem(`match-token.subscribe-${match.id}`);

  try {
    const parsedData = JSON.parse(subscribeData);

    return parsedData.brokerTopic;
  } catch (error) {
    return null;
  }
}

export function getPublishToken(match) {
  try {
    const { publishToken, expirationDate } = getControlData(match.id);

    if (isAfter(new Date(), expirationDate)) {
      removeControlData(match.id);
      return null;
    }

    return publishToken;
  } catch (error) {
    return null;
  }
}
