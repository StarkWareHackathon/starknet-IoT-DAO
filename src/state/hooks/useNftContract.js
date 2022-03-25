import { useContract } from '@starknet-react/core'
import InsuranceNftAbi from '../../abis/InsuranceNFT.json';

export function useNftContract() {
  return useContract({
    abi: InsuranceNftAbi.abi,
    address: '0x022a3539a4e8f029819b74d24d0f88a75750b948359bb50123f195518749167d',
  })
}
