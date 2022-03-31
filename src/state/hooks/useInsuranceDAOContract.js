import { useContract } from '@starknet-react/core'

import InsuranceDAOAbi from '../../abis/InsuranceDAO.json';

export function useInsuranceDAOContract() {
  return useContract({
    abi: InsuranceDAOAbi,
    address: process.env.STARKNET_DAO,
  })
}