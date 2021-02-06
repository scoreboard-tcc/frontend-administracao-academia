import AuthPage from 'pages/auth';
import HomePage from 'pages/home';
import MatchDetailsPage from 'pages/home/matches/details/MatchDetailsPage';
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { clearExpiredTokens } from 'utils/tokens';
import LandingPage from '../pages/landing';

function Router() {
  useEffect(() => {
    clearExpiredTokens();
  }, []);

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <LandingPage />
        </Route>
        <Route path="/auth">
          <AuthPage />
        </Route>
        <Route path="/home">
          <HomePage />
        </Route>
        <Route exact path="/match/:id">
          <MatchDetailsPage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Router;
