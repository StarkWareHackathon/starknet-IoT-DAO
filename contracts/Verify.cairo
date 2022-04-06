%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math import assert_not_zero, assert_nn_le, assert_lt, assert_le
from starkware.starknet.common.syscalls import get_caller_address, get_contract_address
from starkware.cairo.common.uint256 import Uint256, uint256_le, uint256_lt, uint256_add, uint256_eq, uint256_unsigned_div_rem
from starkware.cairo.common.hash_chain import hash_chain
from starkware.cairo.common.hash_state import hash_init, HashState, hash_update, hash_finalize
from starkware.cairo.common.signature import (
    verify_ecdsa_signature)

#constructor
@constructor
func constructor{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        curr_server_address : felt
    ):
    server_address.write(curr_server_address)
    nonce.write(1)
    return ()
end

#storage vars
@storage_var
func server_address() -> (res : felt):
end

@storage_var
func nonce() -> (res : felt):
end

# @external
# func meta_data_verify{
#         syscall_ptr : felt*,
#         pedersen_ptr : HashBuiltin*,
#         ecdsa_ptr : SignatureBuiltin*,
#         range_check_ptr}(
#         address : felt, level : felt, ipfs_uri : Uint256, timestamp : Uint256, sig_r : felt, sig_s : felt)->(
#         res :felt):

#     let (data_ptr : felt*) = alloc()
#     assert data_ptr[0] = address
#     assert data_ptr[1] = level
#     assert data_ptr[2] = ipfs_uri.low
#     assert data_ptr[3] = ipfs_uri.high
#     assert data_ptr[4] = timestamp.low
#     assert data_ptr[5] = timestamp.high

#     let (message) = hash_chain{hash_ptr=pedersen_ptr}(
#         data_ptr)

#     let signer_address : felt = server_address.read()

#     verify_ecdsa_signature(
#         message=message,
#         public_key=signer_address,
#         signature_r=sig_r,
#         signature_s=sig_s)
#     return(res = 1)
# end

@external
func meta_data_verify{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        ecdsa_ptr : SignatureBuiltin*,
        range_check_ptr}(
        address : felt, level : felt, ipfs_uri : Uint256, timestamp : Uint256, sig_r : felt, sig_s : felt)->(
        res :felt):
    alloc_locals
    let (init_hash_state : HashState*) = hash_init()
    let (data_ptr : felt*) = alloc()
    assert data_ptr[0] = address
    assert data_ptr[1] = level
    assert data_ptr[2] = ipfs_uri.low
    assert data_ptr[3] = ipfs_uri.high
    assert data_ptr[4] = timestamp.low
    assert data_ptr[5] = timestamp.high
    let data_length : felt = 6

    let (intermediate_hash_state : HashState*) = hash_update{hash_ptr=pedersen_ptr}(
        init_hash_state, data_ptr, data_length)

    let (message) = hash_finalize{hash_ptr=pedersen_ptr}(
        intermediate_hash_state)

    let signer_address : felt = server_address.read()

    verify_ecdsa_signature(
        message=message,
        public_key=signer_address,
        signature_r=sig_r,
        signature_s=sig_s)
    return(res = 1)
end