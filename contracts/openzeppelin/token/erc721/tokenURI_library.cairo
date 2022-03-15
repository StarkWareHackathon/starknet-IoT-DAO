%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256


from openzeppelin.token.erc721.library import _exists
from openzeppelin.utils.ShortString import uint256_to_ss
from openzeppelin.utils.Array import concat_arr


from openzeppelin.utils.constants import TRUE, FALSE


#
# Storage
#

@storage_var
func ERC721_base_tokenURI(index: felt) -> (res: felt):
end

@storage_var
func ERC721_base_tokenURI_len() -> (res: felt):
end


func ERC721_tokenURI{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr
    }(token_id: Uint256) -> (tokenURI_len: felt, tokenURI: felt*):
    alloc_locals

    let (exists) = _exists(token_id)
    assert exists = TRUE

    # Return tokenURI with an array of felts, `${base_tokenURI}/${token_id}`
    let (local base_tokenURI) = alloc()
    let (local base_tokenURI_len) = ERC721_base_tokenURI_len.read()
    _ERC721_baseTokenURI(base_tokenURI_len, base_tokenURI)
    let (token_id_ss_len, token_id_ss) = uint256_to_ss(token_id)
    let (tokenURI, tokenURI_len) = concat_arr(
        base_tokenURI_len,
        base_tokenURI,
        token_id_ss_len,
        token_id_ss,
    )

    return (tokenURI_len=tokenURI_len, tokenURI=tokenURI)
end

func ERC721_tokenURI_test{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr
    }(token_id: Uint256, ipfs_uri : Uint256) -> (tokenURI_len: felt, tokenURI: felt*):
    alloc_locals

    let (exists) = _exists(token_id)
    assert exists = TRUE

    # Return tokenURI with an array of felts, `${base_tokenURI}/${token_id}`
    let (local base_tokenURI) = alloc()
    let (local base_tokenURI_len) = ERC721_base_tokenURI_len.read()
    _ERC721_baseTokenURI(base_tokenURI_len, base_tokenURI)
    #let (token_id_ss_len, token_id_ss) = uint256_to_ss(ipfs_uri)
    let token_id_ss_len = 2
    let (local token_id_ss : felt*) = alloc()
    token_id_ss[0] =  ipfs_uri.high
    token_id_ss[1] = ipfs_uri.low
    let (tokenURI, tokenURI_len) = concat_arr(
        base_tokenURI_len,
        base_tokenURI,
        token_id_ss_len,
        token_id_ss,
    )

    return (tokenURI_len=tokenURI_len, tokenURI=tokenURI)
end


func _ERC721_baseTokenURI{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr
    }(base_tokenURI_len: felt, base_tokenURI: felt*):
    if base_tokenURI_len == 0:
        return ()
    end
    let (base) = ERC721_base_tokenURI.read(base_tokenURI_len)
    assert [base_tokenURI] = base
    _ERC721_baseTokenURI(base_tokenURI_len=base_tokenURI_len - 1, base_tokenURI=base_tokenURI + 1)
    return ()
end


func ERC721_setBaseTokenURI{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr
    }(tokenURI_len: felt, tokenURI: felt*):
    _ERC721_setBaseTokenURI(tokenURI_len, tokenURI)
    ERC721_base_tokenURI_len.write(tokenURI_len)
    return ()
end


func _ERC721_setBaseTokenURI{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr
    }(tokenURI_len: felt, tokenURI: felt*):
    if tokenURI_len == 0:
        return ()
    end
    ERC721_base_tokenURI.write(index=tokenURI_len, value=[tokenURI])
    _ERC721_setBaseTokenURI(tokenURI_len=tokenURI_len - 1, tokenURI=tokenURI + 1)
    return ()
end