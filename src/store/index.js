import rootReducer from './reducers';

const { createStore } = require('redux');

export default createStore(rootReducer, {});
