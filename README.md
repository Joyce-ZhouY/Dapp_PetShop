# Dapp_PetShop
APS1050 Final Project

## Description
This project is an expansion of the popular DApp Pet Shop, adding five new features to improve the functionality and user experience of the application.
1. The first new feature is the ability to add and register pets to the platform. 
2. The second feature is accessing the file system for the pet photos.
3. The thrid new feature is the ability to keep track of a pet's adoption history. 
4. The fourth new feature is the ability to filter the list of available pets by breed, age, location.
5. The fifth new feature is the ability to filter the list of adopted pets by breed, age, location


## Dependencies

Truffle v5.1.10 (core: 5.1.10)

Solidity v0.5.16 (solc-js)

Node.js v14.15.3

Web3.js v1.2.1

lite-server v2.3.0

Ganache v2.5.4

MetaMask v10.13.0

ipfs v0.12.2

## Installation

1. Install Truffle globally.
    ```javascript
    npm install -g truffle
    ```
2. Compile and migrate the smart contracts.
    ```javascript
    truffle compile
    truffle migrate
    ```
3. Run the `liteserver` development server (outside the development console) for front-end hot reloading. Smart contract changes must be manually recompiled and migrated.
    ```javascript
    // Serves the front-end on http://localhost:3000
    npm run dev
    ```
4. Install and run `ipfs` daemon.

    In a separate terminal:

    CD to the directory containing this project

    Run the following commands to start the ipfs daemon (used for uploading images):
```
ipfs init

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[\"*\"]'

ipfs daemon
```
5. To run the unit tests, run:

```
truffle test
```

