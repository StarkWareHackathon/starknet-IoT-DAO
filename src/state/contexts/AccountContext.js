import React, { useState, createContext } from 'react';
export const AccountContext = createContext({});

export default function AccountProvider({ children, props }) {
  const [globalAccount, setGlobalAccount] = useState("");
  const [globalActive, setGlobalActive] = useState(false);
  const [globalChainId, setGlobalChainId] = useState(0)


  return (
    <AccountContext.Provider
      value={{
        globalAccount,
        globalActive,
        globalChainId,
        setGlobalAccount,
        setGlobalActive,
        setGlobalChainId
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
