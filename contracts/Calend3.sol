// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

contract Calend3 {
  uint rate;
  address owner;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
      require(msg.sender == address(this));
      _;
  }

  function getRate() public view returns (uint) {
        return rate;
  }
  
  function setRate(uint _rate) public onlyOwner {
      rate = _rate;
  }
  
}