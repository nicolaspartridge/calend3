// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

contract Calend3 {
    uint rate;
    address public owner;
    Appointment[] appointments;
    
    constructor() {
        owner = msg.sender;
    }

    struct Appointment {
      string title;
      address attendee;
      uint startTime;
      uint endTime;
      uint amontPaid;
    }

    function getRate() public view returns (uint) {
         return rate;
    }   
    
    function setRate(uint _rate) public {
        require(msg.sender == owner, "Only the owner can set the rate");
        rate = _rate;
    }
}