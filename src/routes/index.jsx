import AuthPage from 'pages/auth';
import HomePage from 'pages/home';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LandingPage from '../pages/landing';

function Router() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <LandingPage />
        </Route>
        <Route path="/auth">
          <AuthPage />
        </Route>
        <Route exact path="/home">
          <HomePage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Router;
