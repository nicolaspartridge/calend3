// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

contract Calend3 {
    uint rate;
    address payable public owner;
    Appointment[] appointments;

    struct Appointment {
      string title;
      address attendee;
      uint startTime;
      uint endTime;
      uint amontPaid;
    }
    
    constructor() {
        owner = payable(msg.sender);
    }

    function getRate() public view returns (uint) {
         return rate;
    }

    function getOwner() public view returns (address) {
        return owner;
    }   
    
    function setRate(uint _rate) public {
        require(msg.sender == owner, "Only the owner can set the rate");
        rate = _rate;
    }

    function getAppointments() public view returns (Appointment[] memory) {
      return appointments;
    }

    function createAppointment(string memory _title, uint _startTime, uint _endTime) public payable {
      Appointment memory appointment;
      appointment.title = _title;
      appointment.attendee = msg.sender;
      appointment.startTime = _startTime;
      appointment.endTime = _endTime;
      appointment.amontPaid = ((_endTime - _startTime) / 60 * rate);

      require(msg.value >= appointment.amontPaid, "You did not meet the correct horuly rate.");
      (bool success,) = owner.call{value: msg.value}(""); // Sends ETH to the owner
      require(success, "Failed to send payment");

      appointments.push(appointment);
    }
}