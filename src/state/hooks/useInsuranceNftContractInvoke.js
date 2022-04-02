import { useStarknetInvoke } from '@starknet-react/core'

export function useInsuranceNftContract(account, contract) {
  const { data: mintData, loading: mintLoading, error: mintError, reset: mintReset, invoke: mintTokens } = useStarknetInvoke({ contract: contract, method: 'mint' })

  const { data: setTokenURIData, loading: setTokenURILoading, error: setTokenURIError, reset: setTokenURIReset, invoke: invokeSetTokenURI } = useStarknetInvoke({ contract: contract, method: 'setTokenURI' })

  const invokeInsuranceNftMint = (tokenUri) => {
    console.log("in the mint invoke!!!")
    mintTokens({ args: [tokenUri, { 'low': 0, 'high': 123 }, account, '1', '1', '1'] })
    console.log(mintError, 'mintError')
  }

  const invokeSetTokenUri = (uri) => {
    console.log("invoke set token uri")
    invokeSetTokenURI({ args: [uri] })
  }

  return { invokeInsuranceNftMint, invokeSetTokenUri }
}