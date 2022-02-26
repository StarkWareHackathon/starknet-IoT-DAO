import React, {createContext, useState, useContext} from 'react';
import { Router, Location, Redirect } from '@reach/router';
import ScrollToTopBtn from './menu/scrollToTop';
import Header from './menu/header';
import Landing from './pages/Landing';
import Mint from './pages/mint';





import { createGlobalStyle } from 'styled-components';
import Wallet from './pages/wallet';
import Collection from './pages/collection';
import Holdings from './pages/holdings';

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;
export const ScrollTop = ({ children, location }) => {
  React.useEffect(() => window.scrollTo(0,0), [location])
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

export const AccountContext = createContext({});

const App=()=> {
  const [globalAccount, setGlobalAccount] = useState("");
  const [globalActive, setGlobalActive] = useState(false);
  const [globalChainId, setGlobalChainId] = useState(0)

  return (
    <div className="wrapper">
      <GlobalStyles />
      <AccountContext.Provider path ="/" value={{globalAccount, setGlobalAccount, globalActive, setGlobalActive, globalChainId, setGlobalChainId}}>
        <Header/>
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
        </AccountContext.Provider>
      <ScrollToTopBtn />
    
    </div>
  );
}

export default App;
