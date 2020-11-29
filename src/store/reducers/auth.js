import { ACTIONS } from 'store/actions/auth';

export default function (state = {}, action) {
  switch (action.type) {
    case ACTIONS.SET_AUTH:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
