import { useStarknetInvoke } from '@starknet-react/core'
import { toBN } from 'starknet/dist/utils/number'
import { bnToUint256, uint256ToBN } from 'starknet/dist/utils/uint256'
import { number, stark } from "starknet";

export function useInsuranceNftContract(account, contract) {
  const { data: mintData, loading: mintLoading, error: mintError, reset: mintReset, invoke: mintTokens } = useStarknetInvoke({ contract: contract, method: 'mint' })

  const { data: setTokenURIData, loading: setTokenURILoading, error: setTokenURIError, reset: setTokenURIReset, invoke: invokeSetTokenURI } = useStarknetInvoke({ contract: contract, method: 'setTokenURI' })

  const invokeInsuranceNftMint = (tokenUri, pendingTimeStamp, r, s, v) => {
    mintTokens({
      args: [[number.toBN(tokenUri).toNumber(), number.toBN(tokenUri).toNumber()], { low: Number(pendingTimeStamp), high: Number(pendingTimeStamp) }, account.toString(), '1', '1', '1']
    })

    console.log(mintError, 'mintError')
  }

  const invokeSetTokenUri = (uri) => {
    console.log("invoke set token uri")
    invokeSetTokenURI({ args: [uri] })
  }

  return { invokeInsuranceNftMint, invokeSetTokenUri }
}