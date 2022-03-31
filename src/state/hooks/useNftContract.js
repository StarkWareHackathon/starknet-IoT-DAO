import { useContract } from '@starknet-react/core'
import InsuranceNftAbi from '../../abis/InsuranceNFT.json';

export function useNftContract() {
  return useContract({
    abi: InsuranceNftAbi.abi,
    address: process.env.STARKNET_NFT,
  })
}
