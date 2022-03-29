import { useStarknetCall } from '@starknet-react/core'

export function useGetTokenFromAddress(contract, tokenIndex) {
  const { data, loading, error } = useStarknetCall({ contract, method: 'getTokenFromAddressArray', args: [tokenIndex] })

  console.log(data, 'getTokenFromAddressArray')
  return { data, loading, error }
}