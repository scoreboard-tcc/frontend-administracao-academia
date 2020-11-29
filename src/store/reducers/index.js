import { combineReducers } from 'redux';
import authRouter from './auth';

export default combineReducers({ auth: authRouter });
