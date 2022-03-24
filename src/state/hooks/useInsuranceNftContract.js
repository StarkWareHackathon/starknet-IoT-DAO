import { useEffect, useState } from 'react';

import {
  StarknetProvider,
  useContract,
  useStarknetBlock,
  useStarknetCall,
  useStarknetInvoke,
  useStarknetTransactionManager,
  Transaction,
  useStarknet,
  InjectedConnector,
} from '@starknet-react/core'

import { Abi } from 'starknet'

import InsuranceNftAbi from '../../abis/InsuranceNFT.json';

//import ContractAddresses from '../addressData.json';

export function useInsuranceNftContract() {
  const useNftContract = () => {
    return useContract({
      abi: InsuranceNftAbi.abi,
      address: '0x022a3539a4e8f029819b74d24d0f88a75750b948359bb50123f195518749167d',
    })
  }

  const { data, loading, error, reset, invoke: mintTokens } = useStarknetInvoke({ contract: useNftContract().contract, method: 'mint' })


  const invokeInsurance = (boolean) => {
    mintTokens({ args: [{ 'low': 0, 'high': 123 }, { 'low': 0, 'high': 123 }, '1', '1', '1', '1'] })
  }

  return { invokeInsurance }
}