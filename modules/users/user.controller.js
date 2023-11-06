const mongoose = require("mongoose");

const Model = require("./user.model");
const instanceController = require('../contractInstances/instances.controller');
const NodeRSA = require('node-rsa');
const c = require("config");

class UserController {
    async findUser(payload) {
      console.log(payload, 'payload')
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
        const { generateKeyPair } = require('crypto');

        try {
            const generateKeyPairAsync = () => {
              return new Promise((resolve, reject) => {
                generateKeyPair(
                  'rsa',
                  {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                      type: 'spki',
                      format: 'pem',
                    },
                    privateKeyEncoding: {
                      type: 'pkcs8',
                      format: 'pem',
                      cipher: 'aes-256-cbc',
                      passphrase: 'top secret',
                    },
                  },
                  (err, publicKey, privateKey) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve({ publicKey, privateKey });
                    }
                  }
                );
              });
            };
        
            // Wait for the key pair generation to complete
            const { publicKey, privateKey } = await generateKeyPairAsync();
        
            const payloadWithKeys = {...payload, publicKey, privateKey };
            const createdModel = await Model.create(payloadWithKeys);
            return createdModel;
          } catch (error) {
            console.error('Error:', error);
          }
    }

    async updateUser(userDetails, payload) {
        // console.log(payload, 'payload');
        // let addUserMetadataToIPFS = await instanceController.addUserMetadataToIPFS(userDetails.publicAddress, payload);
        // console.log(addUserMetadataToIPFS, 'addUserMetadataToIPFS')
        // return
        // payload = {...payload, userDataHash: addUserMetadataToIPFS};
        return Model.findByIdAndUpdate(userDetails.id, payload);
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