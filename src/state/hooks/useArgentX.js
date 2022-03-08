import React, { useState, useEffect, useContext } from 'react';
import { AccountContext } from '../../state/contexts/AccountContext';
import { getStarknet } from "@argent/get-starknet"

export const useArgentX = (props) => {
  const { globalAccount, setGlobalAccount, globalActive, setGlobalActive } = useContext(AccountContext);
  const [connected, setConnected] = useState(false);

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
    const starknet = getStarknet()
    const [userWalletContractAddress] = await starknet.enable({ showModal: true })

    if (userWalletContractAddress) {
      setGlobalAccount(userWalletContractAddress)
      console.log(userWalletContractAddress, 'userWalletContractAddress')
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
