%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math import assert_not_zero, assert_nn_le, assert_lt, assert_le
from starkware.starknet.common.syscalls import get_caller_address, get_contract_address
from starkware.cairo.common.uint256 import Uint256, uint256_le, uint256_lt, uint256_add, uint256_eq, uint256_unsigned_div_rem

from openzeppelin.token.erc721.library import (
    ERC721_name,
    ERC721_symbol,
    ERC721_balanceOf,
    ERC721_ownerOf,
    ERC721_getApproved,
    ERC721_isApprovedForAll,

    ERC721_initializer,
    ERC721_approve,
    ERC721_setApprovalForAll,
    ERC721_transferFrom,
    ERC721_safeTransferFrom,
    ERC721_mint,
    ERC721_burn,
    ERC721_only_token_owner,
)
from openzeppelin.token.erc721.tokenURI_library import (
    ERC721_tokenURI,
    ERC721_setBaseTokenURI
)


from openzeppelin.introspection.ERC165 import ERC165_supports_interface

from openzeppelin.access.ownable import (
    Ownable_initializer,
    Ownable_only_owner
)

@contract_interface
namespace IVerify:
    func meta_data_verify(
            address : felt, level : felt, token_id : felt, timestamp : felt, sig_r : felt, sig_s : felt) -> (
            res : felt):
    end
end

#constructor
@constructor
func constructor{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        name: felt,
        symbol: felt,
        tokenURI_len: felt,
        tokenURI: felt*,
        verify_address: felt,
        dao_address: felt
    ):
    ERC721_initializer(name, symbol)
    let owner : felt = get_caller_address()
    Ownable_initializer(owner)
    ERC721_setBaseTokenURI(tokenURI_len, tokenURI)
    verify_contract_address.write(verify_address)
    dao_contract_address.write(dao_address)
    return ()
end

#storage vars
@storage_var
func verify_contract_address() -> (res : felt):
end

@storage_var
func dao_contract_address() -> (res : felt):
end

#track mint/update of NFTs per address
@storage_var
func last_block_number_update(address : felt) -> (res : Uint256):
end

#last timestamp we used for minting NFT
@storage_var
func last_timestamp_nft_used(address : felt) -> (res : Uint256):
end

#track all NFTs owned by a user
@storage_var
func tokens_by_address(address : felt, index : felt) -> (res : Uint256):
end

@storage_var
func tokens_by_address_len(address : felt) -> (res : felt):
end

#
# Getters
#

@view
func supportsInterface{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(interfaceId: felt) -> (success: felt):
    let (success) = ERC165_supports_interface(interfaceId)
    return (success)
end

@view
func name{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }() -> (name: felt):
    let (name) = ERC721_name()
    return (name)
end

@view
func symbol{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }() -> (symbol: felt):
    let (symbol) = ERC721_symbol()
    return (symbol)
end

@view
func balanceOf{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(owner: felt) -> (balance: Uint256):
    let (balance: Uint256) = ERC721_balanceOf(owner)
    return (balance)
end

@view
func ownerOf{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tokenId: Uint256) -> (owner: felt):
    let (owner: felt) = ERC721_ownerOf(tokenId)
    return (owner)
end

@view
func getApproved{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tokenId: Uint256) -> (approved: felt):
    let (approved: felt) = ERC721_getApproved(tokenId)
    return (approved)
end

@view
func isApprovedForAll{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(owner: felt, operator: felt) -> (isApproved: felt):
    let (isApproved: felt) = ERC721_isApprovedForAll(owner, operator)
    return (isApproved)
end

@view
func tokenURI{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr
    }(tokenId: Uint256) -> (tokenURI_len: felt, tokenURI: felt*):
    let (tokenURI_len: felt, tokenURI: felt*) = ERC721_tokenURI(tokenId)
    return (tokenURI_len=tokenURI_len, tokenURI=tokenURI)
end


#
# Externals
#

@external
func approve{
        pedersen_ptr: HashBuiltin*,
        syscall_ptr: felt*,
        range_check_ptr
    }(to: felt, tokenId: Uint256):
    ERC721_approve(to, tokenId)
    return ()
end

@external
func setApprovalForAll{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr
    }(operator: felt, approved: felt):
    ERC721_setApprovalForAll(operator, approved)
    return ()
end

@external
func transferFrom{
        pedersen_ptr: HashBuiltin*,
        syscall_ptr: felt*,
        range_check_ptr
    }(
        _from: felt,
        to: felt,
        tokenId: Uint256
    ):
    ERC721_transferFrom(_from, to, tokenId)
    return ()
end

@external
func safeTransferFrom{
        pedersen_ptr: HashBuiltin*,
        syscall_ptr: felt*,
        range_check_ptr
    }(
        _from: felt,
        to: felt,
        tokenId: Uint256,
        data_len: felt,
        data: felt*
    ):
    ERC721_safeTransferFrom(_from, to, tokenId, data_len, data)
    return ()
end

@external
func setTokenURI{
        pedersen_ptr: HashBuiltin*,
        syscall_ptr: felt*,
        range_check_ptr
    }(tokenURI_len: felt, tokenURI: felt*):
    Ownable_only_owner()
    ERC721_setBaseTokenURI(tokenURI_len, tokenURI)
    return ()
end

@external
func mint{
        pedersen_ptr: HashBuiltin*,
        syscall_ptr: felt*,
        range_check_ptr
    }(to: felt, tokenId: Uint256):
    Ownable_only_owner()
    ERC721_mint(to, tokenId)
    return ()
end

@external
func burn{
        pedersen_ptr: HashBuiltin*,
        syscall_ptr: felt*,
        range_check_ptr
    }(tokenId: Uint256):
    ERC721_only_token_owner(tokenId)
    ERC721_burn(tokenId)
    return ()
end