import { useContract } from '@starknet-react/core'

import InsuranceDAOAbi from '../../abis/InsuranceDAO.json';

export function useInsuranceDAOContract() {
  return useContract({
    abi: InsuranceDAOAbi,
    address: '0x025fe0c9662ac90461ebd863844227b42210e969f98dd418fb739388fd2f7db3',
  })
}