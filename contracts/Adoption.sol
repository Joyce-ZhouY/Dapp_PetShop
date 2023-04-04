pragma solidity ^0.5.0;

contract Adoption {

// APS1050: Defined a struct to store pet info 
    struct Pet{
        uint id; //0
        string name; //1
        string picture;  //2
        uint age; //3
        string breed; //4
        string location; //5
        address payable adopter; //6
        uint date; //7
        bool isAdopted; //8
    }
    
 



    address[16] public adopters;
    // mapping from petsNum to pets' info
    mapping(uint => Pet) public pets;
    // mapping(uint => PetVote) public petsVotes;

    mapping(uint => uint256) public adoptedTime;

    // petsNum are positive Integer, representing number of pets
    uint public petsNum;
    // myAddr is our wallet address of petshop owner
    string public myAddr = "0x768e18cDD80ef7f0B1aBcBd99E8a2dE204DDCD06";
    // address public owner;
    constructor() public{
        petsNum = 0;
        // owner = msg.sender;
    }

    event Deposit(address indexed from, uint amount);


    // APS1050 Adopting a pet
    function adopt(uint petId) public returns (uint) {
      require(petId >= 0 && petId < petsNum);

      adopters[petId] = msg.sender;
      pets[petId].date = now;
      pets[petId].isAdopted = true;
  

      return petId;
}

    // APS1050 Adding a pet
    function add(string memory name, string memory picture, uint age, string memory breed,
        string memory location) public returns (uint) {

        
        pets[petsNum] = Pet(petsNum, name, picture, age, breed, location, msg.sender, now, false);
        
        // petsVotes[petsNum] = PetVote(petsNum, 0);

        petsNum++;
        return petsNum;
    }

    // Retrieving the numbers of pets
    function getPetsNum() public view returns (uint) {
        return petsNum;
    }

    // APS 1050 Retrieving the pet's details
    function getPetDetails(uint petId) public view returns (uint, string memory, string memory, uint, string memory,
        string memory, address payable, uint, bool) {
        require(petId >= 0 && petId < petsNum);
        Pet memory p = pets[petId];
        return (p.id, p.name, p.picture, p.age, p.breed, p.location, p.adopter, p.date, p.isAdopted);
    }


    function isAdopted(uint petId) public view returns (uint, bool){
        require(petId >= 0 && petId < petsNum);
        Pet memory p = pets[petId];
        return (p.id, p.isAdopted);
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
    return adopters;
    }
}
