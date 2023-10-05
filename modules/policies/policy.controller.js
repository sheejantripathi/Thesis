const mongoose = require("mongoose");
const moment = require("moment");
const { uploadFileIPFS } = require("../../helpers/utils");
// const { ERR } = require("../../helpers");
const Model = require("./policy.model");
const { Web3 } = require('web3');
const providers = new Web3.providers.HttpProvider('http://127.00.1:8545');
let web3 = new Web3(providers);

const policyManager = require('../../build/contracts/PolicyManager.json');
const childContract = require('../../build/contracts/ChildContract.json');

const { ObjectId } = mongoose.Types;

class PolicyController {

  async connection() {
    accounts = await web3.eth.getAccounts();
    consolelog('accounts',accounts)
  }

  async createContractInstance() {
    let accounts = await web3.eth.getAccounts();
    const networkID = await web3.eth.net.getId();
    const {address} = policyManager.networks[networkID];
    // const contractAddress = policyManager.networks[networkID]
    let instance = new web3.eth.Contract(
      policyManager.abi, //smart contract functions in json
      address // address of the smart contract
      )
    return {accounts, instance}
  }

  async registerUserViaSmartContract(payload) {
    console.log('hell yeaaaaaaaaaaaa', payload)
    let {userAddress,
      hasAccess,
      permissions,
      access_from,
      access_to,
      access_type,...rest} = payload
      
    const {accounts, instance} = await this.createContractInstance();
    const response =  instance.methods.registerUsers()
  }

  async heliaFileUploader(fileData) {
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

    // add the bytes to your node and receive a unique content identifier
    const cid = await fs.addBytes(encoder.encode(fileData))
    const fileHash = cid.toString()

    return fileHash;

    console.log('Added file:', cid.toString())

    // create a second Helia node using the same blockstore
    const helia2 = await createHelia({
      blockstore
    })

    // create a second filesystem
    const fs2 = unixfs(helia2)

    // this decoder will turn Uint8Arrays into strings
    const decoder = new TextDecoder()
    let text = ''

    // read the file from the blockstore using the second Helia node
    for await (const chunk of fs2.cat(cid)) {
      text += decoder.decode(chunk, {
        stream: true
      })
    }

    console.log('Added file contents:', text)
  }

  async addPolicy(payload, fileContent) {
    //versioning of the new-policies based on the timestamp
    let fileUploadResult = await this.heliaFileUploader(fileContent);
    const policy_version = moment(Date.now()).format("YYYY-MM-DD-HHmmss");
    payload.policy_version = `POLICY-${payload.assetId}-${policy_version}`;
    payload.fileHash = fileUploadResult;

    const policypayload = { ...payload };
    console.log(policypayload)

    return await Model.create(policypayload);
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
}

module.exports = new PolicyController();
