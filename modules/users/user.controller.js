const Model = require("./user.model");
const instanceController = require('../contractInstances/instances.controller');
const Web3 = require("web3");
require('dotenv').config();
const web3 = new Web3(`${process.env.INFURA_API_KEY}`);
const network = process.env.ETHEREUM_NETWORK;

class UserController {
    async findUser(payload) {
  
        let result = await Model.findOne(payload);
        return result ? result : '';
    }

    async findbyAddress(address) {
      let result = await Model.findOne({publicAddress: address});
      return result ? result : '';
    }

    async getById(userID) {
        return Model.findById(userID).populate('policies');
    }

    async addUser(payload) {
        try {
            const createdModel = await Model.create(payload);
            return createdModel;
          } catch (error) {
            console.error('Error:', error);
          }
    }

    async updateUser(userDetails, payload) {
    
        const {organization, country, username} = payload;
        
        // let userContractInstance = await instanceController.createUserFactoryContractInstance();
        const userMetadataFactoryInstance = await instanceController.createUserFactoryContractInstanceSepolia();
        console.log(userMetadataFactoryInstance.options.address, 'userMetadataFactoryInstance.options.address')
        
        const method_abi = userMetadataFactoryInstance.methods.createUserContract(userDetails.publicAddress, organization, country).encodeABI();        
        console.log(method_abi, 'method_abi')
        
        const tx = {
          from: userDetails.publicAddress,
          to: userMetadataFactoryInstance.options.address,
          data: method_abi,
          value: '0',
          gasPrice: '100000000000',
        };
        
        const gas_estimate = await web3.eth.estimateGas(tx);
        console.log(gas_estimate, 'gas_estimate')
        tx.gas = gas_estimate + 1000000;
        
        const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.SIGNER_PRIVATE_KEY_SECOND);
        // Sending the transaction to the network
        const receipt = await web3.eth
          .sendSignedTransaction(signedTx.rawTransaction)
          .once("transactionHash", (txhash) => {
            console.log(`Mining transaction ...`);
            console.log(`https://${network}.etherscan.io/tx/${txhash}`);
          });
        // The transaction is now on chain!
        console.log(`Mined in block ${receipt.blockNumber}`);
        console.log(receipt, 'result after creating a child contract')
        // console.log(tx, 'tx')

        // const new_ac = "85ebb4df48881d5ae66122fb468f341881c5fb7d9fcffef5f947142bee752d96"
        // // const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.SIGNER_PRIVATE_KEY);
        // const signedTx = await web3.eth.accounts.signTransaction(tx, new_ac);
        // console.log(signedTx, 'signedTx')

        // // Sending the transaction to the network
        // await web3.eth
        //   .sendSignedTransaction(signedTx.rawTransaction)
        //   .once("transactionHash", (txhash) => {
        //     console.log(`Mining transaction ...`);
        //     console.log(`https://${network}.etherscan.io/tx/${txhash}`);
        //   });
        // The transaction is now on chain!
       
        const userModelUpdated = await Model.findByIdAndUpdate(userDetails.id, payload);

        return userModelUpdated;  
    }

    async associateUsersToGroup(usersListToAdd, contractAddress, group) {
      let eoaAddressesToAdd = [];
      for(const user of usersListToAdd){
        eoaAddressesToAdd.push(user.eoaAddress);
      }
      return await Model.updateMany(
            { publicAddress: { $in: eoaAddressesToAdd } },
            { $push: { groups: {contractAddress:contractAddress, name: group} } }
        );
    }

    async associateFilesToOwner({eoaAddress, contractAddress, fileName}) {
      return await Model.updateOne(
          { publicAddress: eoaAddress },
          { $push: { files: {contractAddress:contractAddress, name: fileName} } }
      );
  }

    async findAllUsers({publicAddresses}) {
        console.log(publicAddresses, 'publicAddress')
        Model.find({ publicAddress: { $in: publicAddresses } }).toArray((err, result) => {
            if (err) throw err;
            console.log(result);
            client.close();
        });
    }

    // async getFilesAssociatedWithGroups({userPublicAddress, groupContractAddress}) {
    //     const childContractInstance = await instaceController.createChildContractInstance(groupContractAddress);
    //     const isUserAssociatedWithContract = await childContractInstance.methods.isUserAssociated(userPublicAddress).call();
    //     if (isUserAssociatedWithContract !== true) {
    //         return res
    //             .status(401)
    //             .send({ error: 'User is not associated with the group' });
    //     }
    //     else{
    //         return await childContractInstance.methods.getFilesAssociatedWithGroup().call();
    //     }
    // }

}
module.exports = new UserController();