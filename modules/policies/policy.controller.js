const moment = require("moment");
const Model = require("./policy.model");
const { Web3 } = require('web3');
const providers = new Web3.providers.HttpProvider('http://127.00.1:7545');
let web3 = new Web3(providers);


const transactionController = require("../transactions/transactions.controller");
const userController = require("../users/user.controller");
const fs = require('fs');
require('dotenv').config();
const { PINATA_API_KEY, PINATA_SECRET_API_KEY} = process.env;
console.log(PINATA_API_KEY, PINATA_SECRET_API_KEY, 'PINATA_API_KEY, Pinata_SECRET_API_KEY')
// const {ethers} = require('ethers');
// const INFURA_API_KEY = 'd65a7226079f4b9d9da2e1f694dfcda8'
// const provider = new ethers.BrowserProvider(window.ethereum);
const instanceController = require('../contractInstances/instances.controller');
const crypto = require('crypto');

// Use the JWT key
const pinataSDK = require('@pinata/sdk');
const PinataClient = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);

class PolicyController {

  async extractMetadata(notebookPath) {
    const notebookContent = JSON.parse(fs.readFileSync(notebookPath, 'utf-8'));
  
    // Access the metadata
    const metadata = notebookContent.metadata;
  
    // Access specific metadata fields (e.g., kernel, author)
    const kernel = metadata.kernelspec ? metadata.kernelspec.name : '';
    const author = metadata.author || '';
  
    return { kernel, author };
  }

  async deployAttributeBasedContract(payload) {
    const network = process.env.ETHEREUM_NETWORK;
    let web3 = new Web3(`${process.env.INFURA_API_KEY}`);
 
    const { policies, group_owner } = payload;
    let transaction_results = [];
    // const policyInstance = await instanceController.createPolicyContractInstanceSepolia(); //createPolicyContractInstance is the function that creates the instance of the smart contract
    const policyInstance = await instanceController.createPolicyContractInstance(); //createPolicyContractInstance is the function that creates the instance of the smart contract
    for (let i = 0; i < policies.length; i++) {
        try {
            let result = await policyInstance.methods.createGroupContract(
                policies[i].group,
                policies[i].permissions,
                policies[i].organizations,
                policies[i].countries,
            ).send({ from: group_owner, gas: 3000000} ) //createChildContract is the function in the smart contract that generates the child contract
          
            console.log(result, 'result after creating a child contract')
            // // Issuing a transaction that calls the `echo` method
            // const method_abi = policyInstance.methods.createChildContract(
            //   policies[i].group,
            //   group_owner,
            //   policies[i].permissions,
            //   policies[i].organizations[0],
            //   policies[i].countries[0]).encodeABI();

            // const tx = {
            //   from: group_owner,
            //   to: policyInstance.options.address,
            //   data: method_abi,
            //   value: '0',
            //   gasPrice: '1000000000',
            // };
            // const gas_estimate = await web3.eth.estimateGas(tx);
            // tx.gas = gas_estimate;
            // const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.SIGNER_PRIVATE_KEY);
            // console.log("Raw transaction data: " + ( signedTx).rawTransaction);
            // // Sending the transaction to the network
            // const receipt = await web3.eth
            //   .sendSignedTransaction(signedTx.rawTransaction)
            //   .once("transactionHash", (txhash) => {
            //     console.log(`Mining transaction ...`);
            //     console.log(`https://${network}.etherscan.io/tx/${txhash}`);
            //   });
            // // The transaction is now on chain!
            // console.log(`Mined in block ${receipt.blockNumber}`);
            // console.log(receipt, 'result after creating a child contract')
            // return
            // extracts the child contract address and tahe attribute hash from the transaction log
            const {groupName, contractAddress} = await this.extractChildContractAddress(result);
            // childContractAddress = contractAddress;
          
            //save the transaction details in the database
            const policy_detail = await this.addPolicy(payload);
            
            let transaction_payload = {...result, group:policies[i].group, policyId:policy_detail._id.toString(),
              childContractAddress:contractAddress, ownerAddress:group_owner}; //transaction payload to be stored in the database
/** Indicates the code to associate the files in the smart contract*/
              // if(filesToBeAssociated.length > 0){
              //   await this.addFilesToGroupContract(filesToBeAssociated, contractAddress, asset_owner);
              // }
            const transaction = await transactionController.addTransaction(transaction_payload);
            transaction_results.push(transaction);
              console.log(transaction_results, 'transaction_results')
        } catch (error) {
            console.log('Error processing transaction:', error.message);
            // Handle error if needed
            // You can choose to rethrow the error or return a specific message indicating failure
            return { success: false, message: 'Error processing transaction' };
        }
    }
    // Return a success message once all transactions have been successfully processed
    // let addFilesToGroupContract = await this.addFilesToGroupContract(filesToAddInGroupContract, childContractAddress);
    return { success: true, message: 'Group Smart contract deployed successfully', transactionReceipts: transaction_results};
}

async addFilesToGroupContract(filesToAddInGroupContract, childContractAddress, userAddress) {
  try {

    const childContractinstance = await instanceController.createChildContractInstance(childContractAddress);
    let receipt = await childContractinstance.methods.addFilesToGroup(
      filesToAddInGroupContract
    ).send({ from: userAddress, gas: 1000000} )
    return receipt;   
  } catch (error) {
    console.log(error.message, 'error.message')
  }
}

async extractChildContractAddress(transactionReceipt) { 
  
  const inputs = [
    {
      type: 'string',
      name: 'group',
      indexed: true  // This parameter is indexed
    },
    {
      type: 'address',
      name: 'childContract'
    }
  ];
  
  const logs = transactionReceipt.logs;

  const contractAddressEvent = web3.eth.abi.decodeLog(inputs,logs[0].data, logs[0].topics)
 
  return {groupName: contractAddressEvent.group, contractAddress: contractAddressEvent.childContract};
}

async checkReceiptStatus(transactionHash) {
   const receipt = await web3.eth.getTransactionReceipt(transactionHash);
            console.log('Transaction receipt:', receipt);
            
            if (receipt.status) {
              console.log('Transaction was successful');
            } else {
              console.log('Transaction failed');
            }
}

async createNode () {
    const { createHelia } = await import('helia')
    const { MemoryBlockstore } =await import('blockstore-core')
    const { noise } = await import('@chainsafe/libp2p-noise')
    const { yamux } = await import('@chainsafe/libp2p-yamux')
    const { identifyService } = await import('libp2p/identify')
    const { createLibp2p } = await import('libp2p')
    const { MemoryDatastore } = await import('datastore-core')
    const { bootstrap } = await import('@libp2p/bootstrap')
    const { tcp } = await import('@libp2p/tcp')
  // the blockstore is where we store the blocks that make up files
  const blockstore = new MemoryBlockstore()

  // application-specific data lives in the datastore
  const datastore = new MemoryDatastore()

  // libp2p is the networking layer that underpins Helia
  const libp2p = await createLibp2p({
    datastore,
    addresses: {
      listen: [
        '/ip4/127.0.0.1/tcp/0'
      ]
    },
    transports: [
      tcp()
    ],
    connectionEncryption: [
      noise()
    ],
    streamMuxers: [
      yamux()
    ],
    peerDiscovery: [
      bootstrap({
        list: [
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
        ]
      })
    ],
    services: {
      identify: identifyService()
    }
  })

  return await createHelia({
    datastore,
    blockstore,
    libp2p
  })
}

  async heliaFileUploader(filesToUpload, asset_owner) {
    console.log(filesToUpload, 'fileData')
    const { createHelia } = await import('helia')
    const { unixfs } = await import('@helia/unixfs')
    const { MemoryBlockstore } =await import('blockstore-core')

    const blockstore = new MemoryBlockstore()

// create a Helia node
const helia = await createHelia({
  blockstore
})


// create a filesystem on top of Helia, in this case it's UnixFS
const fs = unixfs(helia)

// we will use this TextEncoder to turn strings into Uint8Arrays
const encoder = new TextEncoder()

let cids = [];
// add the bytes to your node and receive a unique content identifier
for (const file of filesToUpload) {

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
  const cid = await fs.addBytes(encoder.encode(file.data))
  const result = await PinataClient.pinByHash(cid.toString(), options)
  console.log('Added file:', cid.toString())
  console.log(result, 'result')
  cids.push(cid.toString());
}
// const cid = await fs.addBytes(encoder.encode(fileData.data))
// console.log('Added file:', cid.toString())
// return cid.toString();


//     const blockstore = new MemoryBlockstore()

//     const node1 = await this.createNode()
//     const node2 = await this.createNode()

//     const fileContent = fileData.data;

// // connect them together
//     const multiaddrs = node2.libp2p.getMultiaddrs()
//     await node1.libp2p.dial(multiaddrs[0])

//     const heliaFs1 = unixfs(node1);
  
//     // We will use this TextEncoder to turn strings into Uint8Arrays
//     // const encoder = new TextEncoder();
    
//     // Add the notebook content bytes to your node and receive a unique content identifier
//     const fileCid = await heliaFs1.addBytes(fileContent);
    
//     //create a directory
//     const heliaFs2 = unixfs(node2);
//     const dirCid = await heliaFs2.addDirectory();

//     let updatedDirCid = await heliaFs1.cp(fileCid, dirCid, `${fileData.name}`);

//     let filesInDir = [];
//     // create a second filesystem
//     for await (const entry of heliaFs2.ls(updatedDirCid)) {
//       filesInDir.push({name: entry.name, cid : entry.cid.toString()})  
//     }

//     console.log('filesInDir', filesInDir, 'filesInDir')
//     return {fileCid: fileCid.toString(), dirCid: dirCid.toString()};
    // console.log('Added file contents:', text)
  }

//   async heliaUploadAndPin() {
//     import { unixfs } from '@helia/unixfs'
//     import { Configuration, RemotePinningServiceClient } from '@ipfs-shipyard/pinning-service-client'
//     import { createHelia } from 'helia'
//     import { createRemotePinner } from '@helia/remote-pinning'

// const helia = await createHelia()
// const pinServiceConfig = new Configuration({
//   endpointUrl: `${endpointUrl}`, // the URI for your pinning provider, e.g. `http://localhost:3000`
//   accessToken: `${accessToken}` // the secret token/key given to you by your pinning provider
// })

// const remotePinningClient = new RemotePinningServiceClient(pinServiceConfig)
// const remotePinner = createRemotePinner(helia, remotePinningClient)
//   }

  async IPFSPinning(fileData) {
   
    const { Readable } = require('stream');

    // const fileStream = fs.createReadStream('path_to_your_file');
    
    // Assuming fileData is your file object
    const fileBuffer = fileData.data;

      
    // Create a Readable stream from the file buffer
    const readableStream = new Readable();
    readableStream._read = () => {}; // Necessary for Readable stream

    readableStream.push(fileBuffer);
    readableStream.push(null);

    this.encryptStreamAndUploadToIPFS(readableStream);
    // let result = await PinataClient.pinFileToIPFS(readableStream)
    // return result; 
  }

  async updateIPFSFileMetadata(ipfsPinHash, fileName, groupContractAddress) {
    const metadata = {
      name: fileName,
      keyvalues: {
          associatedContract: groupContractAddress,
      }
  }

  const res = await pinata.hashMetadata(ipfsPinHash, metadata)
  console.log(res)
  return res;  
  }

  async getFileDataFromIPFS(cid) {
    const { unixfs } = await import('@helia/unixfs')
    try {
      const node = this.createNode();
      const fs2 = unixfs(node)

      // this decoder will turn Uint8Arrays into strings
      // const decoder = new TextDecoder()
      let text = ''

      // use the second Helia node to fetch the file from the first Helia node
      for await (const chunk of fs2.cat(cid)) {
        text += chunk
      } 

      console.log('Fetched file contents:', text)
    }
    catch (error) {
      console.error('Error fetching file from IPFS:', error);
    }
  }
  

  async addPolicy(payload, fileData) {
    try {
    
      const policy_version = moment(Date.now()).format("YYYY-MM-DD-HHmmss");
      // const {id, name, IPFSHash} = fileData;
      payload.policy_version = `POLICY-${policy_version}`;
      // payload.fileHash = fileHash;
  
      // const assetPayload = [];

      // let fileDetails = fileData.map((file) => {
      //   return {
      //       fileName: file.name.split('.')[0],
      //       fileType: file.name.split('.')[1],
      //       fileCID: file.IPFSHash  
      //   };
      // });

      // let asset_detail = await AssetModel.create(assetPayload);
      // payload.assetId = asset_detail._id;
      let policy_detail = await Model.create(payload);
      return policy_detail;
    } catch (error) {
      // Handle errors appropriately
      console.error('Error adding policy:', error);
      throw new Error('Failed to add policy.');
    }
  }

  async fetchContractDetails(childContractAddress, ownerAddress) {
    try {
      const childContractinstance = await instanceController.createChildContractInstance(childContractAddress);  
      const values = await childContractinstance.methods.getContractDetails().call({ from: ownerAddress});
      return values;
    } catch (error) {
      console.error('Error fetching contract details:', error);
    }
  }

  async getDeployedContractAddresses(ownerAddress) {
    try {
      const instance = await instanceController.createPolicyContractInstance();
      const result = await instance.methods.getDeployedContractAddresses().call({ from: ownerAddress});
      console.log(result, 'result')
      return result;
    } catch (error) {
      console.error('Error fetching contract details:', error);
    }
  }

  async isUserAssociatedWithContract(childContractAddress, userAddress) {
    try {

      console.log(childContractAddress, 'childContractAddress');
      console.log(userAddress, 'userAddress');
      const childContractinstance = await instanceController.createChildContractInstance(childContractAddress);
      if (!childContractinstance.methods.isUserAssociated) {
        console.log('isUserAssociated function not found in the contract ABI')
        throw new Error("isUserAssociated function not found in the contract's ABI");
      }
      
      const estimatedGas = await childContractinstance.methods.isUserAssociated('0x134bab6505b4d05cb1955c0ac00801048035388f').estimateGas();
      console.log(estimatedGas, 'estimatedGas')
      const result = await childContractinstance.methods.isUserAssociated(userAddress).call({
        gas: estimatedGas,  // Set a more accurate gas limit
      });
      console.log(result, 'result')
      return result;
    } catch (error) {
      console.error('Error fetching contract details:', error);
      throw error; // Propagate the error for higher-level handling
    }
  }
  
  
async addUsersToGroup(contractDetails, userAddress) {
  const {contractAddress, usersListToAdd, filesToAdd, groupName} = contractDetails;
  await instanceController.addGroupsToUserContract(contractAddress, groupName, usersListToAdd); 
  
  const childContractinstance = await instanceController.createChildContractInstance(contractAddress); 

  for(let i = 0; i < usersListToAdd.length; i++){
    let fromTimestamp = new Date(usersListToAdd[i].accessFrom).getTime() / 1000;
    let toTimestamp = new Date(usersListToAdd[i].accessTo).getTime() / 1000;
    usersListToAdd[i].accessFrom = fromTimestamp;
    usersListToAdd[i].accessTo = toTimestamp;
  }
 
  let filesAssociatedTOGroup = await childContractinstance.methods.addFilesToGroup(filesToAdd)
  .send({ from: userAddress, gas: 2000000} )

  let receipt = await childContractinstance.methods.associateUsersToGroup(usersListToAdd)
  .send({ from: userAddress, gas: 2000000} )
  // let user_details = await userController.findAllUsers({publicAddresses: contractDetails.eoaAddresses});
  // return

  let userUpdated = await userController.associateUsersToGroup(usersListToAdd, contractAddress, groupName);
  // Check the modified document count to ensure successful updates
  if (userUpdated.nModified > 0) {
    return {message:"Users successfully assigned to the group", userUpdated};
} else {
    return {message:"No users were assigned to the group"};
}
  
}

  newPolicy(payload) {
    return Model.create(payload);
  }

  getById(id) {
    return Model.findById(id);
  }

  getByName(name) {
    return Model.findOne(name);
  }

  validateCustomPolicy(customPolicyData){
    // Perform your validation logic here based on the custom policy schema
    console.log(customPolicyData);
    // Example: Check if required fields are present
    if (!customPolicyData.policy_version || !customPolicyData.data_sensitivity_level) {
      throw new Error('Policy version and data sensitivity level are required.');
    }
  
    // Example: Validate requester_attributes
    if (!customPolicyData.requester_attributes || !customPolicyData.requester_attributes.user) {
      throw new Error('Requester attributes and user data are required.');
    }
  
    // Add more validation logic as needed based on your schema
  
    // If validation passes, return true
    return true;
  };

  async getContractMetadata(contractIndex) {
    try {
      const instance = await instanceController.createPolicyContractInstance();
      const result = await instance.methods.getContractMetadata(contractIndex).call();
      const [contractAddress, assetName] = result;
      console.log('Contract Address:', contractAddress);
      console.log('Asset Name:', assetName);
    } catch (error) {
      console.error('Error fetching contract metadata:', error);
    }
  }

  async checkUserAssociation() {
    try {
      const childContractinstance = await instanceController.createChildContractInstance(childContractAddress);

      await childContractinstance.methods.associateUserToContract(userAddress).send({ from: userAddress });
      const isAssociated = await contract.methods.userToContract(userAddress).call();
      console.log(`User ${userAddress} is associated: ${isAssociated}`);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
}

module.exports = new PolicyController();

