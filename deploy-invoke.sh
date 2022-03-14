#!/bin/bash
output=$(starknet deploy --contract artifacts/InsuranceNFT.json --inputs 20 20 3 97 98 99 20 20  --network alpha-goerli)
echo $output
deploy_tx_id=$(echo $output | sed -r "s/.*Transaction ID: (\w*).*/\1/")
address=$(echo $output | sed -r "s/.*Contract address: (\w*).*/\1/")
echo "{\"address\" : \"$address\"}" > testObj.json
#starknet call --function name --network alpha-goerli --address $address --abi artifacts/abis/InsuranceNFT.json