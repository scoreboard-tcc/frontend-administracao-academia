import React from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import HomePage from '../pages/home';

function Router() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Router;
