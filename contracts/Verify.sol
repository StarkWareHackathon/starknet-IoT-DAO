// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
//import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

contract Verify is Ownable{
    //using ECDSA for bytes32;
   
   mapping (address => uint) public nonces;
   bytes32 public checkHash;
   bytes32 public finalHash;
   address public serverAddress;
   address public NFTAddress;
   address public DAOAddress;
   mapping (address => bool) public serverAddresses;
  
  
  constructor(address _serverAddress) public {
    serverAddress = _serverAddress;
    serverAddresses[_serverAddress] = true;
  }
  
  function getHash(address _mintAddress, string memory _tokenURI, uint256 _tokenId, uint256 _timeStamp) internal returns (bytes32) {
      checkHash = keccak256(abi.encodePacked(nonces[_mintAddress],_mintAddress, address(this), _timeStamp, _tokenURI, _tokenId));
    return keccak256(abi.encodePacked(nonces[_mintAddress],_mintAddress, address(this), _timeStamp, _tokenURI, _tokenId));
  }

  function getDriverHash(address _mintAddress, uint256 level, uint256 _tokenId, uint256 _timeStamp) internal returns (bytes32) {
      checkHash = keccak256(abi.encodePacked(nonces[_mintAddress],_mintAddress, address(this), _timeStamp, level, _tokenId));
    return keccak256(abi.encodePacked(nonces[_mintAddress],_mintAddress, address(this), _timeStamp, level, _tokenId));
  }

  function metaDataVerify(address _mintAddress, string memory _tokenURI, uint256 _tokenId, uint256 timeStamp, bytes32 r, bytes32 s, uint8 v) public returns(bool) {
    require(_msgSender() == NFTAddress, "not called by NFT contract");
    bytes32 hashRecover = getHash(_mintAddress, _tokenURI, _tokenId, timeStamp);
    address signer = ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hashRecover)), v, r, s);
    require( serverAddresses[signer],"SIGNER MUST BE SERVER"); 
    nonces[_mintAddress]++;
    return serverAddresses[signer];
  }

  function driverDataVerify(address ownerAddress, uint256 level, uint256 tokenId, uint256 timeStamp, bytes32 r, bytes32 s, uint8 v) public returns(bool){
    require(_msgSender() == DAOAddress, "not called by DAO contract");
    bytes32 hashRecover = getDriverHash(ownerAddress, level, tokenId, timeStamp);
    address signer = ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hashRecover)), v, r, s);
    require( serverAddresses[signer],"SIGNER MUST BE SERVER"); 
    nonces[ownerAddress]++;
    return serverAddresses[signer];
  }

  function setNFTAddress (address _NFTAddress) public onlyOwner{
    require(_NFTAddress != address(0), "can't set as zero address");
    NFTAddress = _NFTAddress;
  }

  function setDAOAddress (address _DAOAddress) public onlyOwner{
    require(_DAOAddress != address(0), "can't set as zero address");
    DAOAddress = _DAOAddress;
  }
    
}