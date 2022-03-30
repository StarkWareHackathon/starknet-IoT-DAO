import { useContract } from '@starknet-react/core'

import InsuranceDAOAbi from '../../abis/InsuranceDAO.json';

export function useInsuranceDAOContract() {
  return useContract({
    abi: InsuranceDAOAbi,
    address: '0x5cbcbcc91ef1cee879da891c0a68265185507861ec847dc60a9965aa589f821',
  })
}