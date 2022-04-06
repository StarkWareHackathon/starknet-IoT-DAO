import sys
from starkware.crypto.signature.signature import (
    pedersen_hash, private_to_stark_key, sign)

priv_key = 10000000
#edit later to match verify function
hash_1 = pedersen_hash(int(sys.argv[5]), int(sys.argv[6])
hash_2 = pedersen_hash(int(sys.argv[4]), hash_1)
hash_3 = pedersen_hash(int(sys.argv[3]), hash_2)
hash_4 = pedersen_hash(int(sys.argv[2]), hash_3)
hash_5 = pedersen_hash(int(sys.argv[1]), hash_4)

r,s = sign(
    msg_hash = pedersen_hash(6, hash_5),
    priv_key = priv_key)
print(r, s, sep=', ')
