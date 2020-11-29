import { combineReducers } from 'redux';
import academyReducer from './academy';

export default combineReducers({ academy: academyReducer });
