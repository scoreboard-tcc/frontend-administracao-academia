export const ACTIONS = {
  SET_AUTH: 'SET_AUTH',
};

export function setAuth(payload) {
  return {
    type: ACTIONS.SET_AUTH,
    payload,
  };
}
