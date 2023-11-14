const Model = require("./user.model");
const instanceController = require('../contractInstances/instances.controller');


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
      
        let userContractInstance = await instanceController.createUserFactoryContractInstance();
        const userRegistered = await userContractInstance.methods.createUserContract(organization, country)
        .send({ from: userDetails.publicAddress, gas: 3000000 });
        
        // payload = {...payload, userDataHash: addUserMetadataToIPFS};
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