import { ACTIONS } from 'store/actions/academy';

export default function (state = {}, action) {
  switch (action.type) {
    case ACTIONS.SET_ACADEMY:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
