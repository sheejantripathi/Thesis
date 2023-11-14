const { Web3 } = require('web3');
// const web3 = new Web3("https://rpc2.sepolia.org");
const providers = new Web3.providers.HttpProvider('http://127.00.1:7545');
require('dotenv').config();
let web3 = new Web3(providers);

const { Readable } = require('stream');
const crypto = require('crypto');

const { PINATA_API_KEY, PINATA_SECRET_API_KEY} = process.env;
const pinataSDK  = require('@pinata/sdk');
const PinataClient = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);
const Controller = require('../users/user.controller');
// const {ethers} = require('ethers');
// const INFURA_API_KEY = 'd65a7226079f4b9d9da2e1f694dfcda8'
// const provider = new ethers.BrowserProvider(window.ethereum);

const policyManager = require('../../build/contracts/PolicyManager.json');
const groupcontract = require('../../build/contracts/GroupContract.json');
const userMetadataFactory = require('../../build/contracts/UserMetadataFactory.json');
const userMetadata = require('../../build/contracts/UserMetadata.json');


// const {encryptFile} = require('./ipfs-encrypt');

// const pinatasdk = require('api')('@pinata-cloud/v1.0#12ai2blmsggcsb');

async function createPolicyContractInstance() {
    // const web3 = new Web3(
    //     new Web3(`${process.env.INFURA_API_KEY}`)
    //   );  
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = policyManager.networks[networkId];
    const instance = new web3.eth.Contract(
        policyManager.abi,
        deployedNetwork && deployedNetwork.address,
    );
    return instance;
}

async function createPolicyContractInstanceSepolia() {
     // Configuring the connection to an Ethereum node
  const network = process.env.ETHEREUM_NETWORK;
  const web3 = new Web3(
    new Web3(`${process.env.INFURA_API_KEY}`)
  );
  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount(
    "0x" + process.env.SIGNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(signer);
  // Creating a Contract instance
  const contract = new web3.eth.Contract(
    policyManager.abi,
    // Replace this with the address of your deployed contract
    process.env.DEMO_CONTRACT,
  );

  return contract;
}

async function createChildContractInstance(contractAddress) {
    const instance = new web3.eth.Contract(
        groupcontract.abi,
        contractAddress
    );
    return instance;
}

async function createUserFactoryContractInstance() {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = userMetadataFactory.networks[networkId];
  const instance = new web3.eth.Contract(
      userMetadataFactory.abi,
      deployedNetwork && deployedNetwork.address,
  );
  return instance;
}

async function createUserMetadataInstance(contractAddress) {
  const instance = new web3.eth.Contract(
    userMetadata.abi,
      contractAddress
  );
  return instance;
}

async function encryptFile(file) {
    try {
      // Read the file content
    //   const fileContent = fs.readFileSync(filePath);
  
      // Generate an encryption key and IV
      const key = crypto.randomBytes(32); // 256-bit key
      const iv = crypto.randomBytes(16); // 128-bit IV
  
      // Create a cipher using AES-256-CBC algorithm
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
      // Encrypt the file content
      let encrypted = cipher.update(file.data);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
  
      // Save the encrypted content to a new file
    //   const encryptedFilePath = filePath + '.enc';
    //   fs.writeFileSync(encryptedFilePath, encrypted);

  
      return {
        encrypted,
        key: key.toString('hex'),
        iv: iv.toString('hex')
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

async function decryptFile(encryptedBuffer, key, iv) {
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}

  

async function encryptStreamAndUploadToIPFS(filesToUpload, asset_owner) {

    let filesUploaded = [];
    const publicKey = JSON.stringify();

    for (const file of filesToUpload) {
        let encryptedFile = await encryptFile(file);
        console.log(encryptedFile, 'encryptedFile')
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
        const fileBuffer = encryptedFile.encrypted;      
        // Create a Readable stream from the file buffer
        const readableStream = new Readable();
        readableStream._read = () => {}; // Necessary for Readable stream

        readableStream.push(fileBuffer);
        readableStream.push(null);
        // let result = await encryptStreamAndUploadToIPFS(readableStream, options);
        let result = await PinataClient.pinFileToIPFS(readableStream, options)
        filesUploaded.push({...result, fileName:file.name, key: encryptedFile.key, iv: encryptedFile.iv});
    }

    return filesUploaded;
  // Usage example
  let data = Buffer.alloc(0);

  // Read the stream data into a buffer
  readStream.on('data', chunk => {
    data = Buffer.concat([data, chunk]);
  });

  readStream.on('end', async () => {
    try {
      const encryptedData = await encrypt(data);
      console.log(encryptedData, 'encryptedData')
      const result = await PinataClient.pinFileToIPFS(encryptedData, options)
      console.log(result, 'result')
      return result; 
    } catch (error) {
      console.error('Encryption or pinning failed:', error);
    }
  });
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

    // const user = await Controller.findUser({publicAddress: userAddress});
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
    
    // return data; 
}

async function getuserGroupDetials(userAddress) {
    const userMetadataFactoryInstance = await createUserFactoryContractInstance();
    const userContractAddress = await userMetadataFactoryInstance.methods.getUserContractAddress().call({ from: userAddress});
    const userMetadataInstance = await createUserMetadataInstance(userContractAddress);

    const usersGroupInfo = await userMetadataInstance.methods.getUserGroupInfo(userAddress).call({ from: userAddress, gas: 3000000}); 
    return usersGroupInfo;
    
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
        result = {...result, name:file.name}
        filesUploaded.push(result);
      }

    const userMetadataFactoryInstance = await createUserFactoryContractInstance();
    const userContractAddress = await userMetadataFactoryInstance.methods.getUserContractAddress().call({ from: asset_owner});

    const userMetadataInstance = await createUserMetadataInstance(userContractAddress);

    const filesWithoutPinSize = filesUploaded.map(({ PinSize, ...rest }) => rest);

    const usersFilesDetailsStored = await userMetadataInstance.methods.uploadFiles(filesWithoutPinSize).send({ from: asset_owner, gas: 3000000 }); 
    return usersFilesDetailsStored; 
}

async function addGroupsToUserContract(groupContractAddress, groupName, usersListToAdd) {
  const userMetadataFactoryInstance = await createUserFactoryContractInstance();
  for(const user of usersListToAdd){
    const userContractAddress = await userMetadataFactoryInstance.methods.getUserContractAddress().call({ from: user.eoaAddress});
    const userMetadataInstance = await createUserMetadataInstance(userContractAddress);
    const groupsAddeddToUserContract = await userMetadataInstance.methods.associateToGroup(groupName, groupContractAddress).send({ from: user.eoaAddress, gas: 3000000 }); 
  }
 
  return usersListToAdd; 
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
    createUserFactoryContractInstance,
    createUserMetadataInstance,
    addGroupsToUserContract,
    getFilesAssociatedWithGroups, 
    uploadFileToIPFS,
    getuserGroupDetials,
    getFilesAssociatedWithUser,
    updateIPFSFileMetadata,
    encryptStreamAndUploadToIPFS,
    createPolicyContractInstanceSepolia,
    decryptFile
};