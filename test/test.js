const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Calend3", function () {
  let Contract, contract;
  let owner, addr1, addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    Contract = await ethers.getContractFactory("Calend3");
    contract = await Contract.deploy();
    await contract.deployed();
  });

  it("Should set the minutely rate", async function () {
    const tx = await contract.setRate(1000);
    await tx.wait();

    expect(await contract.getRate()).to.equal(1000);
  });

  it("Should fail is non-owner sets rate", async function () {
    await expect(
      contract.connect(addr1).setRate(500)
    ).to.be.revertedWith('Only the owner can set the rate');
  });

  it("Should add two appointments", async function () {
    const tx = await contract.createAppointment("Meeting with Nicolas", 1644143400, 1644150600);
    tx.wait();

    const tx2 = await contract.createAppointment("Second meeting with Nicolas", 1644160000, 1644170000);
    tx2.wait();

    const appointments = await contract.getAppointments();

    expect(appointments.length).to.equal(2);
  });
});
