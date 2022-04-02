import { useContract } from '@starknet-react/core'

import InsuranceDAOAbi from '../../abis/InsuranceDAOMintComp.json';

export function useInsuranceDAOMintContract() {
  return useContract({
    abi: InsuranceDAOAbi.abi,
    address: '0x025fe0c9662ac90461ebd863844227b42210e969f98dd418fb739388fd2f7db3',
  })
}