

import { useContract } from '@starknet-react/core'
import { Abi } from 'starknet'

import InsuranceDAOAbi from '../../abis/InsuranceDAO.json';

export function useInsuranceDAOContract() {
  return useContract({
    abi: InsuranceDAOAbi as Abi,
    address: '0x022a3539a4e8f029819b74d24d0f88a75750b948359bb50123f195518749167d',
  })
}