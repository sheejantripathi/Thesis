const mongoose = require("mongoose");

const Model = require("./user.model");
const instanceController = require('../contractInstances/instances.controller');

class UserController {
    async findUser(payload) {
        let result = await Model.findOne(payload);
        return result ? result : '';
    }

    async getById(userID) {
        return Model.findById(userID).populate('policies');
    }

    async addUser(payload) {
        return Model.create(payload)
    }

    async updateUser(userID, payload) {
        return Model.findByIdAndUpdate(userID, payload);
    }

    async associateUsersToGroup({eoaAddresses, contractAddress, group}) {
        console.log(eoaAddresses, contractAddress, group, 'eoaAddresses, contractAddress, attribute')
        return await Model.updateMany(
            { publicAddress: { $in: eoaAddresses } },
            { $push: { groups: {contractAddress:contractAddress, name: group} } }
        );
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