pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Adoption.sol";

contract TestAdoption {
// The address of the adoption contract to be tested
 Adoption adoption = Adoption(DeployedAddresses.Adoption());

// The id of the pet that will be used for testing
 uint expectedPetId = 0;

//The expected owner of adopted pet is this contract
 address expectedAdopter = address(this);

 // Number of pets
 uint public petsNum;

// run before every test
 function befereTest() public{
  petsNum = 0;
 }



// Tetsing adding a new pet
function testAddANewPet() public{
  uint id = adoption.add("Jack", "https://ipfs.io/ipfs/QmY3MKgdpngKTQwdKHmwCdA6Mb9ouS7HbByvQJfuFnRZMz", 2, "Panda", "China");
  Assert.equal(petsNum, 1, "Number of pets should be one");
}


  // Testing the adopt() function
function testUserCanAdoptPet() public {
  uint returnedId = adoption.adopt(expectedPetId);

  Assert.equal(returnedId, expectedPetId, "Adoption of the expected pet should match what is returned.");
}

// Testing retrieval of a single pet's owner
function testGetAdopterAddressByPetId() public {
  address adopter = adoption.adopters(expectedPetId);

  Assert.equal(adopter, expectedAdopter, "Owner of the expected pet should be this contract");
}

// Testing retrieval of all pet owners
function testGetAdopterAddressByPetIdInArray() public {
  // Store adopters in memory rather than contract's storage
  address[16] memory adopters = adoption.getAdopters();

  Assert.equal(adopters[expectedPetId], expectedAdopter, "Owner of the expected pet should be this contract");
}


// Testing retrieval of a pet's details 
function testGetPetDetailByPetId() public {
  (uint id,string memory name,string memory picture, uint age,string memory breed,string memory loaction,address payable adoptor,uint date, bool isAdopted) = adoption.getPetDetails(expectedPetId);
  Assert.equal(id, expectedPetId, "Wrong id");
  Assert.equal(name, "Jack", "Wrong name");
  Assert.equal(picture, "https://ipfs.io/ipfs/QmY3MKgdpngKTQwdKHmwCdA6Mb9ouS7HbByvQJfuFnRZMz", "Wrong picture");
  Assert.equal(age, 2, "Wrong age");
  Assert.equal(breed, "Panda", "Wrong breed");
  Assert.equal(loaction, "China", "Wrong location");
  Assert.equal(adoptor, expectedAdopter, "Wrong adopter");
  Assert.equal(isAdopted, true, "The pet was adopted");
}
  
}


