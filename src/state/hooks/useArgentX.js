import React, { useState, useEffect, useContext } from 'react';
import { AccountContext } from '../../state/contexts/AccountContext';

import {
  useContract,
  useStarknet,
  InjectedConnector
} from '@starknet-react/core'

export const useArgentX = (props) => {
  const { globalAccount, setGlobalAccount, globalActive, setGlobalActive } = useContext(AccountContext);
  const [connected, setConnected] = useState(false);
   const { account, connect } = useStarknet()
  // Not sure if we need the active call or not
  useEffect(() => {
    if (true) {
      setGlobalActive(true);
    }
    else {
      setGlobalActive(false);
    }
  }, [])

  const connectToArgentX = async () => {
    console.log("in connectToArgentX")
    // Check if wallet extension is installed and initialized.


    if (connect(new InjectedConnector())) {
      setGlobalAccount(account)
      console.log(account, 'account')
    } else {
      console.log("ARGENTX NOT DETECTED")
    }
  }

  return {
    globalAccount,
    setGlobalAccount,
    connectToArgentX,
    setGlobalActive,
    connected,
    setConnected
  }
}

