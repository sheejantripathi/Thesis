const { Web3 } = require('web3');
const providers = new Web3.providers.HttpProvider('http://127.00.1:7545');
let web3 = new Web3(providers);
require('dotenv').config();
const { Readable } = require('stream');


const { PINATA_API_KEY, PINATA_SECRET_API_KEY} = process.env;
console.log(PINATA_API_KEY, PINATA_SECRET_API_KEY, 'yo i am here man')
const pinataSDK  = require('@pinata/sdk');
const PinataClient = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);
// const {ethers} = require('ethers');
// const INFURA_API_KEY = 'd65a7226079f4b9d9da2e1f694dfcda8'
// const provider = new ethers.BrowserProvider(window.ethereum);

const policyManager = require('../../build/contracts/PolicyManager.json');
const childContract = require('../../build/contracts/ChildContract.json');

// const pinatasdk = require('api')('@pinata-cloud/v1.0#12ai2blmsggcsb');

async function createPolicyContractInstance() {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = policyManager.networks[networkId];
    const instance = new web3.eth.Contract(
        policyManager.abi,
        deployedNetwork && deployedNetwork.address,
    );
    return instance;
}

async function createChildContractInstance(contractAddress) {
    const networkId = await web3.eth.net.getId();
    const instance = new web3.eth.Contract(
        childContract.abi,
        contractAddress,
    );
    return instance;
}


async function getFilesAssociatedWithGroups(groupAddress) {
    let metadata = {
        keyvalues: {
            value: groupAddress,
            op: 'eq'
        }
    };
    const data = await PinataClient.pinList(metadata);
    console.log(data, 'data')
    return data; 
}

async function getFilesAssociatedWithUser(userAddress) {
    console.log(userAddress, 'userAddress')
    let metadataFilter = {
        keyvalues: {
            owner: {
                value: userAddress,
                op: 'eq'
                }
            }
        };

        const filters = {
            status : 'pinned',
            metadata: metadataFilter
        };
    const data = await PinataClient.pinList(filters);
    return data; 
}

async function uploadFileToIPFS(filesToUpload, asset_owner) {
    let filesUploaded = [];
    for (const file of filesToUpload) {
        // Process each file here
        let options = {
            pinataMetadata: {
                name: file.name,
                keyvalues: {
                    owner: asset_owner,
                    fileSize: file.size
                }
            },
            pinataOptions: {
                cidVersion: 0
            }
        };
         
        // Assuming fileData is your file object
        const fileBuffer = file.data;      
        // Create a Readable stream from the file buffer
        const readableStream = new Readable();
        readableStream._read = () => {}; // Necessary for Readable stream

        readableStream.push(fileBuffer);
        readableStream.push(null);
        let result = await PinataClient.pinFileToIPFS(readableStream, options)
        filesUploaded.push(result);
      }
   
    return filesUploaded; 
}

async function updateIPFSFileMetadata(ipfsPinHash, contractAddress, contractName) {
    const metadata = {
        keyvalues: {
        }
    };

    metadata.keyvalues[contractName] = contractAddress;
    let data = await pinata.hashMetadata(ipfsPinHash, metadata)
    console.log(data);

}

module.exports = {
    createPolicyContractInstance, 
    createChildContractInstance, 
    getFilesAssociatedWithGroups, 
    uploadFileToIPFS,
    getFilesAssociatedWithUser,
    updateIPFSFileMetadata
};