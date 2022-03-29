import { useContract } from '@starknet-react/core'
import InsuranceNftAbi from '../../abis/InsuranceNFT.json';

export function useNftContract() {
  return useContract({
    abi: InsuranceNftAbi.abi,
    address: '0x34e312849504ac04f185b7a0cc2e938a48f11696d19744d358befd2e1327577',
  })
}
