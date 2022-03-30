import { useContract } from '@starknet-react/core'
import InsuranceNftAbi from '../../abis/InsuranceNFT.json';

export function useNftContract() {
  return useContract({
    abi: InsuranceNftAbi.abi,
    address: '0x0277ea96e3903cb106fa2502996a89c218456b033a3820ccf30f6a3193b70bdf',
  })
}
