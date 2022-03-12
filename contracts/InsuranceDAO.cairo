%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.invoke import invoke
from starkware.cairo.common.registers import get_label_location
from starkware.cairo.common.math import assert_not_zero, assert_nn_le, assert_lt, assert_le
from starkware.cairo.common.uint256 import Uint256, uint256_le, uint256_lt, uint256_add, uint256_eq, uint256_unsigned_div_rem
from starkware.starknet.common.syscalls import get_caller_address, get_contract_address

from contracts.openzeppelin.access.ownable import Ownable_initializer, Ownable_only_owner
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
func cost_schedule(index : felt) -> (res : Uint256):
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
        verify_address : felt):
    let (owner : felt) = get_caller_address()
    Ownable_initializer(owner)
    assert_not_zero(verify_address)
    verify_contract_address.write(verify_address)
    payout_cap.write(Uint256(0,5))
    return ()
end

# ## Getters
@view
func get_penalty_levels{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(index : felt) -> (
        array_len : felt, array : felt*):
    alloc_locals
    let (length : felt) = penalty_levels_length.read()
    let (mapping_ref : felt) = get_label_location(penalty_levels.read)
    let (array : felt*) = alloc()

    _get_array(length, array, mapping_ref)
    return (length, array)
end

@view
func get_acc_levels{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(index : felt) -> (
        array_len : felt, array : felt*):
    alloc_locals
    let (length : felt) = acc_levels_length.read()
    let (mapping_ref : felt) = get_label_location(acc_levels.read)
    let (array : felt*) = alloc()

    _get_array(length, array, mapping_ref)
    return (length, array)
end

@view
func get_costs{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(index : felt) -> (array_len : felt, array : felt*):
    alloc_locals
    let (length : felt) = cost_schedule_length.read()
    let (mapping_ref : felt) = get_label_location(cost_schedule.read)
    let (array : felt*) = alloc()

    _get_array(length, array, mapping_ref)
    return (length, array)
end

@view
func get_ratings{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(index : felt) -> (
        array_len : felt, array : felt*):
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
func get_payout_cap{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (res : Uint256):
    let (res : Uint256) = payout_cap.read()
    return (res)
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
    rating_labels.write(index, new_label)
    return ()
end
###

@external
func add_to_dao{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        level : felt, token_id : felt, timestamp : felt, signature : felt) -> ():
    alloc_locals
    let (cost_schedule_len : felt) = cost_schedule_length.read()
    let (penalty_levels_len : felt) = penalty_levels_length.read()
    with_attr error_message("set DAO cost and price data"):
        assert_not_zero(cost_schedule_len)
        assert_not_zero(penalty_levels_len)
    end

    let (caller_address : felt) = get_caller_address()
    let (verify_contract_addr : felt) = verify_contract_address.read()
    let (is_signature_valid : felt) = IVerify.driver_data_verify(
        verify_contract_addr, caller_address, level, token_id, timestamp, signature)
    with_attr error_message("signer must be server"):
        assert is_signature_valid = TRUE
    end

    let (nft_instance_contract_addr : felt) = nft_instance_contract_address.read()
    let (token_ids_len : felt, token_ids : felt*) = IInsuranceNFT.get_tokens_by_addr(
        nft_instance_contract_addr, caller_address)
    with_attr error_message("not most recent token"):
        assert token_ids[token_ids_len - 1] = token_id
    end

    let (local current_round : felt) = round.read()
    let (caller_level : felt) = levels_entered.read(current_round, caller_address)

    let new_level_payout : felt = (cost_schedule_len - level) * 2 + 2
    let caller_is_existing_member : felt = assert_lt(0, caller_level)
    let (usdc_address : felt) = usdc_contract_address.read()
    let (contract_address : felt) = get_contract_address()
    if caller_is_existing_member == TRUE:
        # transfer tokens into contract
        with_attr error_message("payment failed"):
            let (payout : Uint256) = payout_cap.read()
            let (success : felt) = IERC20.transferFrom(
                usdc_address, caller_address, contract_address, payout)
            assert success = TRUE
        end

        let (round_payout : Uint256) = round_payouts.read(current_round, caller_address)
        with_attr error_message("not change level once a payout is made"):
            let (is_eq : felt) = uint256_eq(round_payout, Uint256(0,0))
            assert is_eq = 0
        end
        let (prior_level : felt) = levels_entered.read(current_round, caller_address)
        with_attr error_message("can only exchange going down levels!"):
            let correct_level : felt = assert_lt(level, prior_level)
            assert correct_level = TRUE
        end
        levels_entered.write(current_round, caller_address, level)
        payment_levels.write(current_round, caller_address, new_level_payout)

        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
    else:
        # new members
        let transaction_value : Uint256 = Uint256(0,10)  # # TODO: Refactor
        let (scheduled_cost : Uint256) = cost_schedule.read(level - 1)
        with_attr error_message("insufficent payment"):
            let (is_cost_paid : felt) = uint256_eq(scheduled_cost, transaction_value)
            assert is_cost_paid = TRUE
        end
        levels_entered.write(current_round, caller_address, level)
        payment_levels.write(current_round, caller_address, new_level_payout)
        let (dao_members_len : felt) = dao_members_length.read(current_round)
        dao_members.write(current_round, dao_members_len, caller_address)
        dao_members_length.write(current_round, dao_members_len + 1)

        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
    end

    current_token_id_for_addr.write(current_round, caller_address, token_id)
    let (current_total_levels : felt) = total_levels.read()
    total_levels.write(current_total_levels + new_level_payout)
    return ()
end

@external
func make_payment{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        amount : Uint256, _payee : felt) -> ():
    alloc_locals
    Ownable_only_owner()
    let (usdc_address : felt) = usdc_contract_address.read()
    let (contract_address : felt) = get_contract_address()
    let (balance : Uint256) = IERC20.balanceOf(usdc_address, contract_address)

    with_attr error_message("insufficient funds"):
        let is_balance_gt_amount : felt = uint256_le(amount, balance)
        assert is_balance_gt_amount = TRUE
    end

    let (current_round : felt) = round.read()
    with_attr error_message("not a member of DAO"):
        let (current_token_id_for_address : felt) = current_token_id_for_addr.read(current_round, _payee)
        assert_not_zero(current_token_id_for_address)
    end

    let (prev_payout : Uint256) = round_payouts.read(current_round, _payee)
    let (payout : Uint256) = payout_cap.read()
    with_attr error_message("max payout for round exceeded"):
        let (possible_payout : Uint256, _) = uint256_add(prev_payout, amount)
        let (is_le : felt) = uint256_le(payout, possible_payout)
        assert is_le = TRUE
    end

    let (new_payout : Uint256, _) = uint256_add(prev_payout, amount)
    round_payouts.write(current_round, _payee, new_payout)

    let (level_entered : felt) = levels_entered.read(current_round, _payee)
    let (scheduled_cost : Uint256) = cost_schedule.read(level_entered)
    let (current_total_levels : felt) = total_levels.read()
    let (is_le : felt) = uint256_le(scheduled_cost, Uint256(0, level_entered))

    let (current_payment_level : felt) = payment_levels.read(current_round, _payee)


    if is_le == TRUE:
        total_levels.write(current_total_levels - current_payment_level)
        payment_levels.write(current_round,_payee, 0)
        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
    else:
        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
    end

    tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
    tempvar syscall_ptr : felt* = syscall_ptr
    
    let (cost_divided : Uint256, _) = uint256_unsigned_div_rem(scheduled_cost, Uint256(0,2))
    let is_le : felt = uint256_lt(cost_divided, Uint256(0, level_entered))
    let is_lt : felt = uint256_lt(prev_payout, scheduled_cost)

    if is_le == is_lt:
        total_levels.write(current_total_levels - current_payment_level / 2)
        payment_levels.write(current_round,_payee, current_payment_level/2)
        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
    else:
        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
    end

    with_attr error_message("payment failed"):
        let (success : felt) = IERC20.transfer(usdc_address, _payee, amount)
        assert success = TRUE
    end

    return ()
end


@external
func make_dao_payout{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}() -> ():
    Ownable_only_owner()
    let (current_round : felt) = round.read()
    return ()
end

# ## Internal function
func increment_round{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}() -> ():
    let (current_value : felt) = round.read()
    assert_nn_le(current_value, current_value + 1)  # overflow check
    round.write(current_value + 1)
    return ()
end


func _get_array{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(array_len: felt, array : felt*, mapping_ref: felt) -> ():
    if array_len == 0:
        return ()
    end
    
    let (array_length_ptr : felt*) = alloc()
    assert array_length_ptr[0] = array_len # invoke expect a pointer as arg
    let val : felt = invoke(mapping_ref, 1, array_length_ptr)
    assert array[array_len] = val

    return _get_array(array_len-1, array, mapping_ref)
end

###
