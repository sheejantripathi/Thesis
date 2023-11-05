// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract FileContract {
    string public fileName;
    string public ipfsHash;

    address public owner;

    constructor(string memory _fileName, string memory _ipfsHash, address _owner) {
        fileName = _fileName;
        ipfsHash = _ipfsHash;
        owner = _owner;
    }
}

