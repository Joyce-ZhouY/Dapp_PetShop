App = {
  web3Provider: null,
  contracts: {},
  

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    // Web3 = require('web3');
    // web3 = new Web3('HTTP://127.0.0.1:7545'); 

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
   
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      return App.loadPages1();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.form-inline',App.filter);
    $(document).on('submit', '.add-form', App.handleRegistration);
  },



  markAdopted: function(petId, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
    
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      // for (i = 0; i < adopters.length; i++) {
      //   if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
      //     $('.panel-pet').eq(i).find('button').text('Adopted').attr('disabled', true);
      //   }
      // }
      $('.panel-pet').eq(petId).find('button').text('Adopted').attr('disabled', true)
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
        
      }).then(function(result) {
        return App.markAdopted(petId, account);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  // APS1050 a function to filter pets by breed, age and location
  type_filter(type, type_value, petsData){
    var results = [];
    if(!(type.length == 0 || type_value.length == 0)){
      console.log("Starting filtering ... ");
      if('breed' === type){ //filter breed of pet
        for(let i = 0; i < petsData.length; i++){
          if(petsData[i][4].toLowerCase() === type_value.toLowerCase()){
            // console.log(petsData[i][4]);
            // console.log(type_value.toLowerCase());
            // console.log(petsData[i][4] === type_value.toLowerCase());
            results.push(petsData[i]);
          }
        }
      }else{
        console.log("filtering by age... ");
        if('age' === type && parseInt(type_value) != NaN){ // filtering age
          for(let i = 0; i < petsData.length; i++){
            if(petsData[i][3] == parseInt(type_value)){
              results.push(petsData[i]);
            }
          }
        }else{// filtering location
          for(let i = 0; i < petsData.length; i++){
            if(petsData[i][5].toLowerCase() === type_value.toLowerCase()){
              results.push(petsData[i]);
            }
          }
        }
      }
    }
    return results;
  },

  // APS 1050 a function to display filtered results
  filter:async function(){
    var adoptionRow = $('#adoptionRow');
    var petTemplate = $('#petTemplate');
    var historyRow = $('#historyRow');
    var all_history = $('#all_history');
    var instance = await App.contracts.Adoption.deployed();
    var petsNum = await instance.getPetsNum();

    // clear rows
    adoptionRow.empty();
    historyRow.empty();
    
    // store all pets in adoptionList
    var adoptionList = [];
    console.log(petsNum);
    for (let i=0; i<petsNum; i++){
      adoptionList.push(instance.getPetDetails(i))
    }

    adoptionList = await Promise.all(adoptionList);
    console.log(adoptionList);

    // filter parameter
    var filterType=document.getElementById("filterType").value; //  breed, age ...
    var filterValue=document.getElementById("filterValue").value; // value of type
    var filterAdopt=document.getElementById("filterAdopt").value; // adopted or non-adopted or all
    console.log(filterAdopt);
    console.log(filterType);
    console.log(filterValue);

    var filter_results = App.type_filter(filterType, filterValue, adoptionList);
    console.log(filter_results);
    if (filterAdopt === 'all'){// if filterAdopt == "all"
      if (filterValue.length > 0){
        if (filter_results.length > 0){
          for (let i=0; i<filter_results.length; i++){
            petTemplate.find('.panel-title').text(filter_results[i][1]);
            petTemplate.find('img').attr('src', filter_results[i][2]);
            petTemplate.find('.pet-age').text(filter_results[i][3]);
            petTemplate.find('.pet-breed').text(filter_results[i][4]);
            petTemplate.find('.pet-location').text(filter_results[i][5]);
            petTemplate.find('.btn-adopt').attr('data-id', filter_results[i][0]);
            // petTemplate.find('.btn-adopt-vote').attr('data-id-like-adopt', filter_results[i][0]);
            petTemplate.find('#adoptButton').attr('hidden', false);

            if (filter_results[i][8]) {
              // $('.panel-pet').eq(i).find('.btn-adopt').text('Adopted').attr('disabled', true);
              petTemplate.find('.btn-adopt').text('Adopted').attr('disabled', true);
            } else {
              petTemplate.find('.btn-adopt').text('Adopt').attr('disabled', false);
            }
            adoptionRow.append(petTemplate.html());
          }
        }
      }else{
        // only filter by adopt or not
        for (let i=0; i<adoptionList.length; i++) {
          petTemplate.find('.panel-title').text(adoptionList[i][1]);
          petTemplate.find('img').attr('src', adoptionList[i][2]);
          petTemplate.find('.pet-age').text(adoptionList[i][3]);
          petTemplate.find('.pet-breed').text(adoptionList[i][4]);
          petTemplate.find('.pet-location').text(adoptionList[i][5]);
          petTemplate.find('.btn-adopt').attr('data-id', adoptionList[i][0]);
          petTemplate.find('#adoptButton').attr('hidden', false);

          if (adoptionList[i][8]) {
            petTemplate.find('.btn-adopt').text('Adopted').attr('disabled', true);
          } else {
            petTemplate.find('.btn-adopt').text('Adopt').attr('disabled', false);
          }
          adoptionRow.append(petTemplate.html());
        }
      }
      
    }else{
      if (filterAdopt === 'adopted'){ // filter adopted pets
        if (filterValue.length > 0){
          if (filter_results.length > 0){
            for (let i=0; i<filter_results.length; i++){
              if (filter_results[i][8]){
                petTemplate.find('.panel-title').text(filter_results[i][1]);
                petTemplate.find('img').attr('src', filter_results[i][2]);
                petTemplate.find('.pet-age').text(filter_results[i][3]);
                petTemplate.find('.pet-breed').text(filter_results[i][4]);
                petTemplate.find('.pet-location').text(filter_results[i][5]);
                petTemplate.find('.btn-adopt').attr('data-id', filter_results[i][0]);
    
                if (filter_results[i][8]) {
                  petTemplate.find('.btn-adopt').text('Adopted').attr('disabled', true);
                } else {
                  petTemplate.find('.btn-adopt').text('Adopt').attr('disabled', false);
                }
                adoptionRow.append(petTemplate.html());
              }
            }
          }
        }else{
          for (let i=0; i<adoptionList.length; i++){
            if (adoptionList[i][8]){
              petTemplate.find('.panel-title').text(adoptionList[i][1]);
              petTemplate.find('img').attr('src', adoptionList[i][2]);
              petTemplate.find('.pet-age').text(adoptionList[i][3]);
              petTemplate.find('.pet-breed').text(adoptionList[i][4]);
              petTemplate.find('.pet-location').text(adoptionList[i][5]);
              petTemplate.find('.btn-adopt').attr('data-id', adoptionList[i][0]);
  
              if (adoptionList[i][8]) {
                petTemplate.find('.btn-adopt').text('Adopted').attr('disabled', true);
              } else {
                petTemplate.find('.btn-adopt').text('Adopt').attr('disabled', false);
              }
              adoptionRow.append(petTemplate.html());
            }
          }
        }
        
      }else{// filter not adopted pet
        if (filterValue.length > 0){
          if (filter_results.length > 0){
            for (let i=0; i<filter_results.length; i++){
              if (!filter_results[i][8]){
                petTemplate.find('.panel-title').text(filter_results[i][1]);
                petTemplate.find('img').attr('src', filter_results[i][2]);
                petTemplate.find('.pet-age').text(filter_results[i][3]);
                petTemplate.find('.pet-breed').text(filter_results[i][4]);
                petTemplate.find('.pet-location').text(filter_results[i][5]);
                petTemplate.find('.btn-adopt').attr('data-id', filter_results[i][0]);
       
                if (filter_results[i][8]) {
                  petTemplate.find('.btn-adopt').text('Adopted').attr('disabled', true);
                } else {
                  petTemplate.find('.btn-adopt').text('Adopt').attr('disabled', false);
                }
                adoptionRow.append(petTemplate.html());
              }
            }
          }
        }else{
          for (let i=0; i<adoptionList.length; i++){
            if (!adoptionList[i][8]){
              petTemplate.find('.panel-title').text(adoptionList[i][1]);
              petTemplate.find('img').attr('src', adoptionList[i][2]);
              petTemplate.find('.pet-age').text(adoptionList[i][3]);
              petTemplate.find('.pet-breed').text(adoptionList[i][4]);
              petTemplate.find('.pet-location').text(adoptionList[i][5]);
              petTemplate.find('.btn-adopt').attr('data-id', adoptionList[i][0]);
              // petTemplate.find('.btn-adopt-vote').attr('data-id-like-adopt', adoptionList[i][0]);
            
              if (adoptionList[i][8]) {
                petTemplate.find('.btn-adopt').text('Adopted').attr('disabled', true);
              } else {
                petTemplate.find('.btn-adopt').text('Adopt').attr('disabled', false);
              }
              adoptionRow.append(petTemplate.html());
            }
          }
        }
        
      }
    }

    // display adoption history
    for (let i = 0; i < adoptionList.length; i++){
      if(adoptionList[i][8]){
        var date = new Date();
        date.setTime(parseInt(adoptionList[i][7]) * 1000)
        var result = date.toGMTString();
        historyRow.find('.time-stamp').text("At " + result);
        historyRow.find('.history').text(adoptionList[i][1] + " (Pet id: " + adoptionList[i][0].c[0] + ")"
                                              + " has been adopted by user: " + adoptionList[i][6]);
        all_history.append(historyRow.html());
      }
    }
  },

  loadPages1:async function(){
    var adoptionRow = $('#adoptionRow');
    var petTemplate = $('#petTemplate');
    var historyRow = $('#historyRow');
    var all_history = $('#all_history');
    var instance = await App.contracts.Adoption.deployed();
    var petsNum = await instance.getPetsNum();

    adoptionRow.empty();
    // store all pets in adoptionList
    var adoptionList = [];
    console.log(petsNum);
    for (let i=0; i<petsNum; i++){
      adoptionList.push(instance.getPetDetails(i))
    }

    adoptionList = await Promise.all(adoptionList);
    console.log(adoptionList);


    // filter parameter
    // var filterType=document.getElementById("filterType").value; //  breed, age ...
    // var filterValue=document.getElementById("filterValue").value; // value of type
    var filterAdopt=document.getElementById("filterAdopt").value; // adopted or non-adopted or all
    console.log(filterAdopt)
    
      for (let i=0; i<adoptionList.length; i++) {
        petTemplate.find('.panel-title').text(adoptionList[i][1]);
        petTemplate.find('img').attr('src', adoptionList[i][2]);
        petTemplate.find('.pet-age').text(adoptionList[i][3]);
        petTemplate.find('.pet-breed').text(adoptionList[i][4]);
        petTemplate.find('.pet-location').text(adoptionList[i][5]);
        petTemplate.find('.btn-adopt').attr('data-id', adoptionList[i][0]);
        petTemplate.find('.btn-adopt-vote').attr('data-id-like-adopt', adoptionList[i][0]);
        // petTemplate.find('#isForSale').attr('hidden', true);
        petTemplate.find('#adoptButton').attr('hidden', false);
        // petTemplate.find('#saleButton').attr('hidden', true);
  
        if (adoptionList[i][8]) {
          petTemplate.find('.btn-adopt').text('Adopted').attr('disabled', true);
          var date = new Date();
          date.setTime(parseInt(adoptionList[i][7]) * 1000)
          var result = date.toGMTString();
          historyRow.find('.time-stamp').text("At " + result);
          historyRow.find('.history').text(adoptionList[i][1] + " (Pet id: " + adoptionList[i][0].c[0] + ")"
                                          + " has been adopted by user: " + adoptionList[i][6]);
          all_history.append(historyRow.html());
        } else {
          petTemplate.find('.btn-adopt').text('Adopt').attr('disabled', false);
        }
        adoptionRow.append(petTemplate.html());
      }
    
  },
  

  // aps1050 a function to add a new pet and store pets' images using ipfs
  registerPets: function(newData){ //input array of new pet's data
    var adoptionInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      console.log(account);
      const reader = new FileReader();
      reader.onloadend = function () {
        const ipfs = window.IpfsApi('localhost', 5001)
        const buf = buffer.Buffer(reader.result)
        ipfs.files.add(buf, (err, result) => {
          if (err) {
            console.error(err)
            return
          }
          var url = `https://ipfs.io/ipfs/${result[0].hash}`;

          App.contracts.Adoption.deployed().then(function(instance) {
            adoptionInstance = instance;
            console.log(parseInt(adoptionInstance.getPetsNum()));
            console.log(newData);
            return adoptionInstance.add(newData.name, url, parseInt(newData.age),
                newData.breed, newData.location, { from: account, gas: 320000 });
          }).then(function(result) {
            console.log((adoptionInstance.getPetDetails(1)));
            alert("Added Successfully!");
          }).then(function(result){
            // if added Successfully, go to main page
            window.location.replace("index.html");
          }).catch(function(err) {
            console.log(err.message);
          });
        })
      }
      const petPic = document.getElementById("pic");
      reader.readAsArrayBuffer(petPic.files[0]);
    })
  },

  // aps1050 a function to handle the event of adding a pet
  handleRegistration: function(event) {
    event.preventDefault();
    //check if the form is filled
    let new_age = parseInt(document.querySelector('#age').value);
    let new_name = document.querySelector('#name').value;
    let new_breed = document.querySelector('#breed').value;
    let new_location = document.querySelector('#location').value;
    let new_picture = document.querySelector('#pic').value;
    // let new_isForSale = document.querySelector('input[name=event_type]:checked').value;
    // let new_price = parseInt(document.querySelector('#price').value);
    // $('.btn-register').text(new_picture);
    // document.getElementById("message_output").innerText = new_picture;
    if (!(new_age.length == 0 || new_age < 0 || new_name.length == 0 || new_breed.length == 0 ||
        new_location.length == 0 ||new_picture.length == 0)){
        // new pet data
        var Pet = {
          age: new_age,
          breed: new_breed,
          name: new_name,
          location: new_location,
          picture: new_picture
        }
      
    }

    App.registerPets(Pet);

  },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
