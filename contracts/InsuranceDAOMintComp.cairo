%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.invoke import invoke
from starkware.cairo.common.registers import get_label_location
from starkware.cairo.common.math import assert_not_zero, assert_nn_le, assert_lt, assert_le
from starkware.cairo.common.math_cmp import is_le
from starkware.cairo.common.uint256 import (
    Uint256, uint256_le, uint256_lt, uint256_add, uint256_sub, uint256_eq, uint256_unsigned_div_rem, uint256_mul)
from starkware.starknet.common.syscalls import get_caller_address, get_contract_address

from contracts.openzeppelin.access.ownable import Ownable_initializer, Ownable_only_owner, Ownable_get_owner
from contracts.openzeppelin.token.erc20.interfaces.IERC20 import IERC20
from contracts.openzeppelin.utils.constants import TRUE

@contract_interface
namespace IInsuranceNFT:
    func get_tokens_by_addr(address : felt) -> (token_ids_len : felt, token_ids : felt*):
    end
end

@contract_interface
namespace IVerify:
    func driver_data_verify(
            address : felt, level : felt, token_id : felt, timestamp : felt, signature : felt) -> (
            res : felt):
    end
end

# ## Arrays
@storage_var
func cost_schedule(index : felt) -> (res : felt):
end

@storage_var
func cost_schedule_length() -> (res : felt):
end

@storage_var
func rating_average_breaks(index : felt) -> (res : felt):
end

@storage_var
func rating_average_breaks_length() -> (res : felt):
end

@storage_var
func penalty_levels(index : felt) -> (res : felt):
end

@storage_var
func penalty_levels_length() -> (res : felt):
end

@storage_var
func acc_levels(index : felt) -> (res : felt):
end

@storage_var
func acc_levels_length() -> (res : felt):
end
###

@storage_var
func total_levels() -> (res : felt):
end

# ## Mapping to array
@storage_var
func dao_members(round : felt, index : felt) -> (sender : felt):
end

@storage_var
func dao_members_length(round : felt) -> (index : felt):
end

# ## Mappings
@storage_var
func round_payouts(index : felt, address : felt) -> (res : Uint256):
end

@storage_var
func levels_entered(index : felt, address : felt) -> (res : felt):
end

@storage_var
func payment_levels(index : felt, address : felt) -> (res : felt):
end

@storage_var
func rating_labels(index : felt) -> (res : felt):
end

@storage_var
func rating_labels_len() -> (res : felt):
end

@storage_var
func current_token_id_for_addr(index : felt, address : felt) -> (res : felt):
end
###
@storage_var
func round() -> (res : felt):
end

@storage_var
func verify_contract_address() -> (res : felt):
end

@storage_var
func nft_instance_contract_address() -> (res : felt):
end

@storage_var
func usdc_contract_address() -> (address : felt):
end

# USDc
@storage_var
func payout_cap() -> (res : Uint256):
end
###

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        verify_address : felt, owner : felt, label_arr_len : felt, label_arr : felt*):
    #let (owner : felt) = get_caller_address()
    Ownable_initializer(owner)
    assert_not_zero(verify_address)
    verify_contract_address.write(verify_address)
    round.write(1)
    payout_cap.write(Uint256(5000000, 0))#added in decimals to make it more realistic
    return()
end

# ## Getters
@view
func get_penalty_levels{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        index : felt) -> (array_len : felt, array : felt*):
    alloc_locals
    let (length : felt) = penalty_levels_length.read()
    let (mapping_ref : felt) = get_label_location(penalty_levels.read)
    let (array : felt*) = alloc()

    _get_array(length, array, mapping_ref)
    return (length, array)
end

@view
func get_acc_levels{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        index : felt) -> (array_len : felt, array : felt*):
    alloc_locals
    let (length : felt) = acc_levels_length.read()
    let (mapping_ref : felt) = get_label_location(acc_levels.read)
    let (array : felt*) = alloc()

    _get_array(length, array, mapping_ref)
    return (length, array)
end

@view
func get_costs{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        array_len : felt, array : felt*):
    alloc_locals
    let (length : felt) = cost_schedule_length.read()
    let (mapping_ref : felt) = get_label_location(cost_schedule.read)
    let (array : felt*) = alloc()

    _get_array(length, array, mapping_ref)
    return (length, array)
end

@view
func get_ratings{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        index : felt) -> (array_len : felt, array : felt*):
    alloc_locals
    let (length : felt) = rating_average_breaks_length.read()
    let (mapping_ref : felt) = get_label_location(rating_average_breaks.read)
    let (array : felt*) = alloc()

    _get_array(length, array, mapping_ref)
    return (length, array)
end

@view
func get_current_round{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        res : felt):
    let (res : felt) = round.read()
    return (res)
end

@view
func get_dao_members{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        round : felt, index : felt) -> (res : felt):
    let (res : felt) = dao_members.read(round, index)
    return (res)
end

@view
func get_payout_cap{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        res : Uint256):
    let (res : Uint256) = payout_cap.read()
    return (res)
end

@view
func get_owner{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        res : felt):
    return Ownable_get_owner()
end

@view
func get_label_at_index{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(index : felt) -> (
        res : felt):
    let (label : felt) = rating_labels.read(index)
    return (label)
end

@view
func get_label_len{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        res : felt):
    let (len : felt) = rating_labels_len.read()
    return (len)
end

###

# ## Setters
@external
func set_usdc_contract_address{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        address : felt) -> ():
    assert_not_zero(address)
    Ownable_only_owner()
    usdc_contract_address.write(address)
    return ()
end

@external
func set_nft_contract{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        nft_contract : felt) -> ():
    assert_not_zero(nft_contract)
    Ownable_only_owner()
    nft_instance_contract_address.write(nft_contract)
    return ()
end

@external
func set_label{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        new_label : felt, index : felt) -> ():
    assert_not_zero(index)
    Ownable_only_owner()
    let (curr_length : felt) = rating_labels_len.read()
    let max_length : felt = curr_length + 1
    assert_le(index, max_length)
    rating_labels.write(index, new_label)
        
    if index == max_length:
        rating_labels_len.write(max_length)
        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
    else:
        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
    end
    return ()
end
###

@external
func set_cost_schedule{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        rating_breaks_len : felt, rating_breaks : felt*, costs_len : felt, costs : felt*) -> ():
    alloc_locals
    Ownable_only_owner()
    let (current_round : felt) = round.read()
    let (current_round_dao_members_length : felt) = dao_members_length.read(current_round)
    with_attr error_message("already members for this round"):
        assert current_round_dao_members_length = 0
    end

    with_attr error_message("no costs"):
        assert_not_zero(costs_len)
    end

    with_attr error_message("unequal arrays"):
        assert costs_len = rating_breaks_len
    end

    let (valid_costs : felt) = _check_valid_costs(costs_len, costs, rating_breaks_len, rating_breaks, 0, 0, 0)

    with_attr error_message("invalid costs or ratings"):
        assert valid_costs = TRUE
    end

    let (cost_schedule_write_ptr : felt) = get_label_location(cost_schedule.write)
    _write_to_array(costs_len, costs, cost_schedule_write_ptr)
    cost_schedule_length.write(costs_len)

    let (rating_average_breaks_ptr : felt) = get_label_location(rating_average_breaks.write)
    _write_to_array(rating_breaks_len, rating_breaks, rating_average_breaks_ptr)
    rating_average_breaks_length.write(rating_breaks_len)
    
    return ()
end

func _check_valid_costs{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        costs_len : felt, costs : felt*, rating_breaks_len : felt, rating_breaks : felt*, max_cost : felt,
        max_rating : felt, counter : felt) -> (valid : felt):
    if costs_len == counter:
        return (valid = 1)
    end

    let is_less_than_max_cost : felt = is_le(costs[counter], max_cost)
    
    if is_less_than_max_cost == TRUE:
        return (valid = 0)
    end

    let is_rating_le_than_max : felt = is_le(rating_breaks[counter], max_rating)
    if is_rating_le_than_max == TRUE:
        return (valid = 0)
    end
    
    return _check_valid_costs(
        costs_len = costs_len, costs = costs, rating_breaks_len = rating_breaks_len, rating_breaks = rating_breaks,
        max_cost = costs[counter], max_rating = rating_breaks[counter], counter = counter + 1)
end

@external
func set_penalties{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        levels_len : felt, levels : felt*, penalties_len : felt, penalties : felt*) -> ():
    Ownable_only_owner()
    let (current_round : felt) = round.read()
    let (current_round_dao_members_length : felt) = dao_members_length.read(current_round)
    with_attr error_message("already members for this round"):
        assert current_round_dao_members_length = 0
    end

    with_attr error_message("arr lengths"):
        assert levels_len = penalties_len
    end

    let (acc_levels_write_ptr : felt) = get_label_location(acc_levels.write)
    _write_to_array(levels_len, levels, acc_levels_write_ptr)
    acc_levels_length.write(levels_len)

    let (penalty_levels_write_ptr : felt) = get_label_location(penalty_levels.write)
    _write_to_array(penalties_len, penalties, penalty_levels_write_ptr)
    penalty_levels_length.write(penalties_len)
    return ()
end

# ## Internal function
func increment_round{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}() -> ():
    let (current_value : felt) = round.read()
    assert_nn_le(current_value, current_value + 1)  # overflow check
    round.write(current_value + 1)
    return ()
end

func _get_array{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        array_len : felt, array : felt*, mapping_ref : felt) -> ():

    let index = array_len - 1
    tempvar args = cast(new (syscall_ptr, pedersen_ptr, range_check_ptr, index), felt*)
    invoke(mapping_ref, 4, args)
    let syscall_ptr = cast([ap - 4], felt*)
    let pedersen_ptr = cast([ap - 3], HashBuiltin*)
    let range_check_ptr = [ap - 2]
    assert array[index] = [ap - 1]

    if index == 0:
        return ()
    end

    return _get_array(array_len - 1, array, mapping_ref)
end

func _write_to_array{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        array_len : felt, array : felt*, mapping_ref : felt) -> ():
    let index = array_len - 1
    tempvar value_to_write = [array + index]
    tempvar args = cast(new (syscall_ptr, pedersen_ptr, range_check_ptr, index, value_to_write), felt*)
    invoke(mapping_ref, 5, args)
    let syscall_ptr = cast([ap - 3], felt*)
    let pedersen_ptr = cast([ap - 2], HashBuiltin*)
    let range_check_ptr = [ap - 1]
    if index == 0:
        return ()
    end

    return _write_to_array(array_len - 1, array, mapping_ref)
end

func _get_current_balance{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        erc20_address : felt) -> (balance : Uint256):
    let (contract_address : felt) = get_contract_address()
    let (balance : Uint256) = IERC20.balanceOf(erc20_address, contract_address)

    return (balance)
end