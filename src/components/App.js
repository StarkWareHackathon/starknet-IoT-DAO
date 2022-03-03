import React, { createContext, useState, useContext } from 'react';
import { Router, Location, Redirect } from '@reach/router';
import ScrollToTopBtn from './menu/scrollToTop';
import Header from './menu/header';
import Landing from './pages/Landing';
import Mint from './pages/mint';
import { createGlobalStyle } from 'styled-components';
import Collection from './pages/collection';
import Holdings from './pages/holdings';

import PebbleContextProvider from '../state/PebbleContextProvider';
import { StarknetProvider } from '@starknet-react/core';

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;
export const ScrollTop = ({ children, location }) => {
  React.useEffect(() => window.scrollTo(0, 0), [location])
  return children
}


const PosedRouter = ({ children }) => (
  <Location>
    {({ location }) => (
      <div id='routerhang'>
        <div key={location.key}>
          <Router location={location}>
            {children}
          </Router>
        </div>
      </div>
    )}
  </Location>
);


const App = () => {

  return (
    <div className="wrapper">
      <GlobalStyles />
      <PebbleContextProvider>
        <StarknetProvider>
          <Header />
          <PosedRouter>
            <ScrollTop path="/">

              <Landing exact path="/">
                <Redirect to="/landing" />
              </Landing>

              <Collection path="/profile" />
              <Holdings path="/holdings" />
              <Mint path="/mint" />

            </ScrollTop>
          </PosedRouter>
        </StarknetProvider>
      </PebbleContextProvider>
      <ScrollToTopBtn />

    </div>
  );
}

export default App;
