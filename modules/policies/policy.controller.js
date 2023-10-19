const mongoose = require("mongoose");
const moment = require("moment");
const { uploadFileIPFS } = require("../../helpers/utils");
// const { ERR } = require("../../helpers");
const Model = require("./policy.model");
const AssetModel = require("./asset.model");
const { Web3 } = require('web3');
const providers = new Web3.providers.HttpProvider('http://127.00.1:7545');
let web3 = new Web3(providers);
const transactionController = require("../transactions/transactions.controller");
const fs = require('fs');

// const {ethers} = require('ethers');
// const INFURA_API_KEY = 'd65a7226079f4b9d9da2e1f694dfcda8'
// const provider = new ethers.BrowserProvider(window.ethereum);

const policyManager = require('../../build/contracts/PolicyManager.json');
const childContract = require('../../build/contracts/ChildContract.json'); 

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

  async createContractInstance() {
    let accounts = await web3.eth.getAccounts();
    const networkID = await web3.eth.net.getId();
    const {address} = policyManager.networks[networkID];
    let instance = new web3.eth.Contract(
      policyManager.abi, //smart contract functions in json
      address // address of the smart contract
      )
    return {accounts, instance}
  }

  async createChildContractInstance(address) {
    let accounts = await web3.eth.getAccounts();
    // const networkID = await web3.eth.net.getId();
    // const {address} = childContract.networks[networkID];
    let childContractinstance = new web3.eth.Contract(
      childContract.abi, //smart contract functions in json
      address // address of the smart contract
      )
    return {accounts, childContractinstance}
  }

  async deployAttributeBasedContract(payload, asset_detail, ownerDetails) {
    
    let attributes = payload.contract_details.attributes;
    let transaction_results = [];
  
    const { accounts, instance } = await this.createContractInstance(); //createContractInstance is the function that creates the instance of the smart contract
    console.log(ownerDetails.publicAddress, 'ownerDetails.publicAddress')
    for (let i = 0; i < attributes.length; i++) {
        let fromTimestamp = new Date(attributes[i].access_from).getTime() / 1000;
        let toTimestamp = new Date(attributes[i].access_to).getTime() / 1000;
        try {
            let result = await instance.methods.createChildContract(
              attributes[i].attribute,
              ownerDetails.publicAddress,
                attributes[i].permissions,
                fromTimestamp,
                toTimestamp,
                asset_detail.fileCID,
                asset_detail.fileName,
            ).send({ from: ownerDetails.publicAddress, gas: 2000000} ) //createChildContract is the function in the smart contract that generates the child contract

            //extracts the child contract address and tahe attribute hash from the transaction log
            const {attribute, childContractAddress} = await this.extractChildContractAddress(result);
            let transaction_payload = {...result, attribute:attributes[i].attribute, assetID:asset_detail._id,
               childContractAddress:childContractAddress, ownerAddress:ownerDetails.publicAddress}; //transaction payload to be stored in the database

            //save the transaction details in the database
            const transaction = await transactionController.addTransaction(transaction_payload);
            transaction_results.push(transaction);
        } catch (error) {
            console.log('Error processing transaction:', error.message);
            // Handle error if needed
            // You can choose to rethrow the error or return a specific message indicating failure
            return { success: false, error: 'Error processing transaction' };
        }
    }
    // Return a success message once all transactions have been successfully processed
    return { success: true, message: 'Transactions completed successfully', transactionReceipts: transaction_results };
}

async extractChildContractAddress(transactionReceipt) { 
  
  const inputs = [
    {
      type: 'string',
      name: 'attribute',
      indexed: true  // This parameter is indexed
    },
    {
      type: 'address',
      name: 'childContract'
    }
  ];
  
  const logs = transactionReceipt.logs;

  const contractAddressEvent = web3.eth.abi.decodeLog(inputs,logs[0].data, logs[0].topics)
  return {attribute: contractAddressEvent.attribute, childContractAddress: contractAddressEvent.childContract};
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

  async heliaFileUploader(fileContent) {
    const { createHelia } = await import('helia')
    const { unixfs } = await import('@helia/unixfs')
    const { MemoryBlockstore } =await import('blockstore-core')

    // Create a Helia node
    const helia = await createHelia();
  
    // Create a filesystem on top of Helia, in this case it's UnixFS
    const heliaFs = unixfs(helia);
  
    // We will use this TextEncoder to turn strings into Uint8Arrays
    const encoder = new TextEncoder();
  
    // Add the notebook content bytes to your node and receive a unique content identifier
    const cid = await heliaFs.addBytes(encoder.encode(fileContent), helia.blockstore);
  
    return cid.toString();
    // // create a second Helia node using the same blockstore
    // const helia2 = await createHelia({
    //   blockstore
    // })

    // // create a second filesystem
    // const fs2 = unixfs(helia2)

    // // this decoder will turn Uint8Arrays into strings
    // const decoder = new TextDecoder()
    // let text = ''

    // // read the file from the blockstore using the second Helia node
    // for await (const chunk of fs2.cat(cid)) {
    //   text += decoder.decode(chunk, {
    //     stream: true
    //   })
    // }

    // console.log('Added file contents:', text)
  }

  async addPolicy(payload, fileData) {
    try {
      const fileContent = fileData.data;
      const cid = await this.heliaFileUploader(fileContent);
  
      const policy_version = moment(Date.now()).format("YYYY-MM-DD-HHmmss");
      payload.policy_version = `POLICY-${policy_version}`;
      // payload.fileHash = fileHash;
  
      const assetPayload = {
        fileName: fileData.name.split('.')[0],
        ownerAddress: payload.asset_owner,
        fileType: fileData.name.split('.')[1],
        fileCID: cid,
      };

      let asset_detail = await AssetModel.create(assetPayload);
      payload.assetId = asset_detail._id;
      let policy_detail = await Model.create(payload);
      return {policy_detail, asset_detail};
    } catch (error) {
      // Handle errors appropriately
      console.error('Error adding policy:', error);
      throw new Error('Failed to add policy.');
    }
  }

  async fetchContractDetails(address, ownerDetails) {
    try {
      const { accounts, childContractinstance } = await this.createChildContractInstance(address);
      // console.log(childContractinstance.methods, 'childContractinstance.methods')
      
      const values = await childContractinstance.methods.getContractDetails().call({ from: ownerDetails.publicAddress});
      return values;
    } catch (error) {
      console.error('Error fetching contract details:', error);
    }
  }

  async isUserAssociatedWithContract(childContractAddress, userAddress) {
    try {

      console.log(childContractAddress, 'childContractAddress');
      console.log(userAddress, 'userAddress');
      const { accounts, childContractinstance } = await this.createChildContractInstance(childContractAddress);
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
  
  
async addUserToContract(payload, ownerDetails) {
  console.log(payload, 'payload')

  const { accounts, childContractinstance } = await this.createChildContractInstance(payload.contractAddress); 
  console.log(childContractinstance.methods, 'childContractinstance.methods')
  let receipt = await childContractinstance.methods.associateUserToContract(
    payload.eoaAddress
  ).send({ from: ownerDetails.publicAddress, gas: 2000000} )

  // console.log(receipt, 'receipt')
  return receipt
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
      const { accounts, instance } = await this.createContractInstance();
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
      const { accounts, childContractinstance } = await this.createChildContractInstance(childContractAddress);

      await childContractinstance.methods.associateUserToContract(userAddress).send({ from: userAddress });
      const isAssociated = await contract.methods.userToContract(userAddress).call();
      console.log(`User ${userAddress} is associated: ${isAssociated}`);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
}

module.exports = new PolicyController();

