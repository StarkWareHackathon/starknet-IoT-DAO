// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verify.sol";
import "./InsuranceNFT.sol";


contract InsuranceDAO is Ownable{
    using Counters for Counters.Counter;
    
    Counters.Counter private _round;

    uint256[] internal costSchedule;//costs for each driver NFT
    uint256[] internal ratingAverageBreaks; // where the average breaks are
    uint public payoutCap = 0.5 ether;//payout cap per block
    uint public totalLevels; //current payout levels total
    uint256[] internal penaltyLevels; //penalty and acceleration levels
    uint256[] internal accLevels; //levels acceleration where penalites occur
    mapping (uint => mapping (address => uint)) public roundPayouts; //payouts in current round
    mapping (uint => mapping (address => uint)) public levelsEntered;//level of each driver originally for cost
    mapping (uint => mapping (address => uint)) public paymentLevels;//level of each driver for payments
    mapping (uint => string) public ratingLabels; //Labels for each level
    mapping (uint => address payable[]) internal DAOMembers; // addresses currently in DAO
    mapping (uint => mapping (address => uint)) public currentTokenIdForAddr;//current tokenId used by DAO member address
    Verify verifyContract; //verifying contract
    InsuranceNFT NFTInstance;//NFT contract

    constructor(address _verifyAddress){
        verifyContract = Verify(_verifyAddress);
        _round.increment();
    }

    receive() payable external{

    }

    function addToDao(uint256 level, uint256 tokenId, uint256 timeStamp, bytes32 r, bytes32 s, uint8 v) public payable {
        require(costSchedule.length >0 && penaltyLevels.length > 0 , "set DAO cost and price data");
        require(verifyContract.driverDataVerify(_msgSender(), level, tokenId, timeStamp, r, s, v), "signer must be server");
        uint[] memory tokenIds = NFTInstance.getTokensByAddr(_msgSender());
        require(tokenIds[tokenIds.length -1] == tokenId, "not most recent token");
        uint256 rebate = 0;
        uint256 priorLevel = 0;
        uint256 newLevelPayout = (costSchedule.length -level)*2+2;
        //existing members getting better rating
        if(levelsEntered[_round.current()][_msgSender()] > 0){
            require(roundPayouts[_round.current()][_msgSender()] == 0, "cannot change level once a payout is made");
            priorLevel = levelsEntered[_round.current()][_msgSender()];
            require (priorLevel > level, "can only exchange going down levels!");
            levelsEntered[_round.current()][_msgSender()] = level;
            paymentLevels[_round.current()][_msgSender()] = newLevelPayout;
            rebate = costSchedule[priorLevel-1] - costSchedule[level-1];
        }
        //new members
        else{
        require(msg.value >= costSchedule[level-1], "insufficent payment");
        levelsEntered[_round.current()][_msgSender()] = level;
        paymentLevels[_round.current()][_msgSender()] = newLevelPayout;
        DAOMembers[_round.current()].push(payable(_msgSender()));
        }
        currentTokenIdForAddr[_round.current()][_msgSender()] = tokenId;
        totalLevels += newLevelPayout;
        if(rebate > 0){
            (bool success, ) = payable(_msgSender()).call{value : msg.value + rebate}("");
            require(success, "transaction unsuccessful");
        }
        else if(msg.value > costSchedule[level-1]){
            (bool success, ) = payable(_msgSender()).call{value : msg.value - costSchedule[level-1]}("");
            require(success, "transaction unsuccessful");
        }
    }

    function setCostSchedule(uint[] memory costs, uint[] memory _ratingBreaks) public onlyOwner{
        require(DAOMembers[_round.current()].length == 0, "already members for this round");
        require(costs.length >= 1, "no costs");
        require(costs.length == _ratingBreaks.length, "unequal arrays");
        uint256 maxCost = 0;
        uint256 maxRating =0;
        bool validCosts = true;
        for(uint8 i=0; i<costs.length; i++){
            if(costs[i] < maxCost || _ratingBreaks[i] <= maxRating){
                validCosts = false;
            }
            else{
                maxCost = costs[i];
                maxRating = _ratingBreaks[i];
            }
        }
        require(validCosts , "invalid costs or ratings");
        costSchedule = costs;
        ratingAverageBreaks = _ratingBreaks;
    }

    function setPenalties(uint[] memory levels, uint[] memory penalties) public onlyOwner{
        require(DAOMembers[_round.current()].length == 0, "already members for this round");
        require(levels.length == penalties.length, "arr lengths");
        uint[] memory tempLevels = new uint[](levels.length);
        uint[] memory tempPenalties = new uint[](levels.length);

        for (uint8 i=0; i<levels.length; i++){
            tempLevels[i] = levels[i];
            tempPenalties[i] = penalties[i]; 
        }
        accLevels = tempLevels;
        penaltyLevels = tempPenalties;
    }

    function setNFTContract(address payable NFTContract) public onlyOwner{
        NFTInstance = InsuranceNFT(NFTContract);
    }

    function setLabel (string memory newLabel, uint index) public onlyOwner{
        ratingLabels[index] = newLabel;
    }

    function getPenaltyLevels() public view returns(uint[] memory){
        return penaltyLevels;
    }

    function getAccLevels() public view returns(uint[] memory){
        return accLevels;
    }

    function getCosts() public view returns(uint[] memory){
        return costSchedule;
    }

    function getRatings() public view returns(uint[] memory){
        return ratingAverageBreaks;
    }

    function getCurrentRound() public view returns(uint){
        uint currentRound = _round.current();
        return currentRound;
    }

    function getDAOMembers(uint round) public view returns(address payable[] memory){
        return DAOMembers[round];
    }

    //logic for making a payout from DAO for auto claim
    function makePayment(uint amount, address payable _payee) public onlyOwner{
        require(address(this).balance >= amount, "insufficient funds");
        require(currentTokenIdForAddr[_round.current()][_payee] != 0 , "not a member of DAO");
        require(roundPayouts[_round.current()][_payee] + amount <= payoutCap, "max payout for round exceeded");
        uint prevPayout = roundPayouts[_round.current()][_payee];
        roundPayouts[_round.current()][_payee] += amount;
        if(roundPayouts[_round.current()][_payee] >= costSchedule[levelsEntered[_round.current()][_payee]]){
            totalLevels -= paymentLevels[_round.current()][_payee];
            paymentLevels[_round.current()][_payee] = 0;
        }
        else if(roundPayouts[_round.current()][_payee] >= costSchedule[levelsEntered[_round.current()][_payee]]/2){
            if(prevPayout < costSchedule[levelsEntered[_round.current()][_payee]]/2){
                totalLevels -= paymentLevels[_round.current()][_payee]/2;
                paymentLevels[_round.current()][_payee]/=2;
            }
        }
        (bool success, ) = _payee.call{value : amount}("");
        require(success, "payout failed");
    }

    //Pay back rewards to DAO
    function makeDAOPayout() public onlyOwner {
        address payable[] memory currentMembers = DAOMembers[_round.current()];
        require(currentMembers.length > 0, "must be at least one member in the DAO");
        uint basePayout = address(this).balance/totalLevels;
        address payable[] memory members = DAOMembers[_round.current()];
        for(uint i = 0; i<members.length; i++){
            (bool success, ) = members[i].call{value : paymentLevels[_round.current()][members[i]]*basePayout}("");
            require(success, "tx failed");
        }
        _round.increment();
    }
}