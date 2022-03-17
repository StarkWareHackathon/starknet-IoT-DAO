import React, { useState, useEffect, useContext } from 'react';
import { AccountContext } from '../../state/contexts/AccountContext';

import {
  useContract,
  useStarknet,
  useStarknetCall,
  InjectedConnector
} from '@starknet-react/core'

import InsuranceNftAbi from '../../abis/InsuranceNFT.json';

// Deploy transaction was sent. Contract address: 0x022a3539a4e8f029819b74d24d0f88a75750b948359bb50123f195518749167d
// Transaction hash: 0x7e27e7ad562837c3407965c5bb4bad67999a3d340b2ad0d9dbf4369a345883d
const useInsuranceNftContract = (props) => {
  const { globalAccount, setGlobalAccount, globalActive, setGlobalActive } = useContext(AccountContext);
  const insuranceNftAddress = '0x022a3539a4e8f029819b74d24d0f88a75750b948359bb50123f195518749167d';
  const myAddress = '0x03ceac5dd4b48f61d6680d3d16adf504ba3dadff55f4eb2389cadbde9731464d';

  const nftContract = useContract({ abi: InsuranceNftAbi.abi, address: insuranceNftAddress })

  const { data: counter, error } = useStarknetCall({
    nftContract,
    method: 'mint',
    args: ['1', '1', myAddress, '1', '1', '1',],
  })


  return {
    // mintNftToken
  }
}

export default useInsuranceNftContract;
