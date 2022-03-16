import sys
from starkware.crypto.signature.signature import (
    pedersen_hash, private_to_stark_key, sign)

priv_key = 10000000
#edit later to match verify function
r,s = sign(
    msg_hash = pedersen_hash(int(sys.argv[1]), int(sys.argv[2])),
    priv_key = priv_key)

