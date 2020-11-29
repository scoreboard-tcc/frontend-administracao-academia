export const ACTIONS = {
  SET_ACADEMY: 'SET_ACADEMY',
};

export function setAcademy(payload) {
  return {
    type: ACTIONS.SET_ACADEMY,
    payload,
  };
}
