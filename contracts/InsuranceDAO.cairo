%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math import assert_not_zero, assert_nn_le, assert_lt, assert_le
from starkware.starknet.common.syscalls import get_caller_address

from contracts.openzeppelin.access.ownable import Ownable_initializer, Ownable_only_owner
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
func round() -> (res : felt):
end

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
func payout_cap() -> (res : felt):
end

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
func round_payouts(index : felt, address : felt) -> (res : felt):
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

@storage_var
func verify_contract_address() -> (res : felt):
end

@storage_var
func nft_instance_contract_address() -> (res : felt):
end
###

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        verify_address : felt):
    let (owner : felt) = get_caller_address()
    Ownable_initializer(owner)
    assert_not_zero(verify_address)
    verify_contract_address.write(verify_address)
    return ()
end

# ## Getters
# @view
# func get_penalty_levels{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(index : felt) -> (
#         res : felt):
#     let (res : felt) = penalty_levels.read(index)
#     return (res)
# end

# @view
# func get_acc_levels{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(index : felt) -> (
#         res : felt):
#     let (res : felt) = acc_levels.read(index)
#     return (res)
# end

# @view
# func get_costs{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(index : felt) -> (res : felt):
#     let (res : felt) = cost_schedule.read(index)
#     return (res)
# end

# @view
# func get_ratings{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(index : felt) -> (
#         res : felt):
#     let (res : felt) = rating_average_breaks.read(index)
#     return (res)
# end

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
###

# ## Setters
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

    let (current_round : felt) = round.read()
    let (caller_level : felt) = levels_entered.read(current_round, caller_address)

    let new_level_payout : felt = (cost_schedule_len - level) * 2 + 2
    let caller_is_existing_member : felt = assert_lt(0, caller_level)
    if caller_is_existing_member == TRUE:
        with_attr error_message("not change level once a payout is made"):
            let (round_payout : felt) = round_payouts.read(current_round, caller_address)
            assert round_payout = 0
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
        let transaction_value = 10  # # TODO: Refactor
        let (scheduled_cost : felt) = cost_schedule.read(level - 1)
        with_attr error_message("insufficent payment"):
            let is_cost_paid : felt = assert_le(scheduled_cost, transaction_value)
            assert is_cost_paid = TRUE
        end
        levels_entered.write(current_round, caller_address, level)
        payment_levels.write(current_round, caller_address, new_level_payout)
        let (dao_members_len : felt) = dao_members_length.read(current_round)
        dao_members.write(current_round, dao_members_len, caller_address)
        dao_members_length.write(dao_members_len + 1)

        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
    end

    current_token_id_for_addr.write(current_round, caller_address, token_id)
    let (current_total_levels : felt) = total_levels.read()
    total_levels.write(current_total_levels + new_level_payout)

    if rebate > 0 :

    end


    return ()
end

# ## Internal function
func increment_round{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}() -> ():
    let (current_value : felt) = round.read()
    assert_nn_le(current_value, current_value + 1)  # overflow check
    round.write(current_value + 1)
    return ()
end

###
